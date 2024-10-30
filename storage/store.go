package storage

import (
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/zerolog"
)

const DbFileName = "vultisig.db"

//go:embed migrate/*.sql
var migrations embed.FS

type Store struct {
	log zerolog.Logger
	db  *sql.DB
}

// NewStore creates a new store
func NewStore() (*Store, error) {
	db, err := sql.Open("sqlite3", DbFileName)
	if err != nil {
		return nil, fmt.Errorf("fail to open sqlite db,err: %w", err)
	}
	return &Store{
		db:  db,
		log: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}, nil
}

// Migrate migrates the db
func (s *Store) Migrate() error {
	driver, err := sqlite3.WithInstance(s.db, &sqlite3.Config{})
	if err != nil {
		return fmt.Errorf("could not create sqlite driver, err: %w", err)
	}

	d, err := iofs.New(migrations, "migrate")
	if err != nil {
		return fmt.Errorf("could not create iofs driver, err: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", d, "sqlite3", driver)
	if err != nil {
		return fmt.Errorf("could not create migrate instance, err: %w", err)
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("could not apply migrations, err: %w", err)
	}

	return nil
}

// SaveVault saves a vault
func (s *Store) SaveVault(vault *Vault) error {
	if vault.PublicKeyECDSA == "" {
		return fmt.Errorf("invalid , vault's public key ecdsa is required")
	}

	buf, err := json.Marshal(vault.Signers)
	if err != nil {
		return fmt.Errorf("could not marshal signers, err: %w", err)
	}

	query := `INSERT OR REPLACE INTO vaults (
		name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
		local_party_id, signers, reshare_prefix, listorder, is_backedup, folder_id
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	var folderIDStr interface{}
	if vault.FolderID != nil {
		folderIDStr = vault.FolderID.String()
	} else {
		folderIDStr = nil
	}

	_, err = s.db.Exec(query,
		vault.Name,
		vault.PublicKeyECDSA,
		vault.PublicKeyEdDSA,
		vault.CreatedAt,
		vault.HexChainCode,
		vault.LocalPartyID,
		string(buf),
		vault.ResharePrefix,
		vault.Order,
		vault.IsBackedUp,
		folderIDStr)
	if err != nil {
		return fmt.Errorf("could not upsert vault, err: %w", err)
	}

	for _, keyShare := range vault.KeyShares {
		if err := s.saveKeyshare(vault.PublicKeyECDSA, keyShare); err != nil {
			return fmt.Errorf("could not save keyshare, err: %w", err)
		}
	}
	for _, coin := range vault.Coins {
		if _, err := s.SaveCoin(vault.PublicKeyECDSA, coin); err != nil {
			return fmt.Errorf("could not save coin, err: %w", err)
		}
	}
	return nil
}


// UpdateVaultName updates the vault name
func (s *Store) UpdateVaultName(publicKeyECDSA, name string) error {
	query := `UPDATE vaults SET name = ? WHERE public_key_ecdsa = ?`
	_, err := s.db.Exec(query, name, publicKeyECDSA)
	return err
}

// GetVault gets a vault
func (s *Store) GetVault(publicKeyEcdsa string) (*Vault, error) {
	query := `SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
		local_party_id, signers, reshare_prefix, listorder, is_backedup, folder_id
		FROM vaults WHERE public_key_ecdsa = ?`
	row := s.db.QueryRow(query, publicKeyEcdsa)
	var signers string
	var vault Vault
	var folderIDStr sql.NullString
	err := row.Scan(&vault.Name,
		&vault.PublicKeyECDSA,
		&vault.PublicKeyEdDSA,
		&vault.CreatedAt,
		&vault.HexChainCode,
		&vault.LocalPartyID,
		&signers,
		&vault.ResharePrefix,
		&vault.Order,
		&vault.IsBackedUp,
		&folderIDStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("vault not found")
		}
		return nil, fmt.Errorf("could not scan vault, err: %w", err)
	}
	if folderIDStr.Valid {
		folderID, err := uuid.Parse(folderIDStr.String)
		if err != nil {
			return nil, fmt.Errorf("could not parse folder ID, err: %w", err)
		}
		vault.FolderID = &folderID
	} else {
		vault.FolderID = nil
	}
	if err := json.Unmarshal([]byte(signers), &vault.Signers); err != nil {
		return nil, fmt.Errorf("could not unmarshal signers, err: %w", err)
	}
	keyShares, err := s.getKeyShares(publicKeyEcdsa)
	if err != nil {
		return nil, fmt.Errorf("could not get keyshares, err: %w", err)
	}
	vault.KeyShares = keyShares
	coins, err := s.GetCoins(publicKeyEcdsa)
	if err != nil {
		return nil, fmt.Errorf("could not get coins, err: %w", err)
	}
	vault.Coins = coins
	return &vault, nil
}

func (s *Store) closeRows(rows *sql.Rows) {
	err := rows.Close()
	if err != nil {
		s.log.Error().Err(err).Msg("could not close rows")
	}
}

func (s *Store) saveKeyshare(vaultPublicKeyECDSA string, keyShare KeyShare) error {
	query := `INSERT OR REPLACE INTO keyshares (public_key_ecdsa, public_key, keyshare) VALUES (?, ?, ?)`
	_, err := s.db.Exec(query, vaultPublicKeyECDSA, keyShare.PublicKey, keyShare.KeyShare)
	if err != nil {
		return fmt.Errorf("could not upsert keyshare, err: %w", err)
	}
	return nil
}

func (s *Store) getKeyShares(vaultPublicKeyECDSA string) ([]KeyShare, error) {
	keySharesQuery := `SELECT public_key, keyshare FROM keyshares WHERE public_key_ecdsa = ?`
	keySharesRows, err := s.db.Query(keySharesQuery, vaultPublicKeyECDSA)
	if err != nil {
		return nil, fmt.Errorf("could not query keyshares, err: %w", err)
	}
	defer s.closeRows(keySharesRows)
	var keyShares []KeyShare
	for keySharesRows.Next() {
		var keyShare KeyShare
		if err := keySharesRows.Scan(&keyShare.PublicKey, &keyShare.KeyShare); err != nil {
			return nil, fmt.Errorf("could not scan keyshare, err: %w", err)
		}
		keyShares = append(keyShares, keyShare)
	}
	return keyShares, nil
}

// GetVaults gets all vaults
func (s *Store) GetVaults() ([]*Vault, error) {
	query := `SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
		local_party_id, signers, reshare_prefix, listorder, is_backedup, folder_id FROM vaults`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query vaults, err: %w", err)
	}
	defer s.closeRows(rows)

	var vaults []*Vault
	for rows.Next() {
		var vault Vault
		var signers string
		var folderIDStr sql.NullString
		err := rows.Scan(&vault.Name,
			&vault.PublicKeyECDSA,
			&vault.PublicKeyEdDSA,
			&vault.CreatedAt,
			&vault.HexChainCode,
			&vault.LocalPartyID,
			&signers,
			&vault.ResharePrefix,
			&vault.Order,
			&vault.IsBackedUp,
			&folderIDStr)
		if err != nil {
			return nil, fmt.Errorf("could not scan vault, err: %w", err)
		}
		if folderIDStr.Valid {
			folderID, err := uuid.Parse(folderIDStr.String)
			if err != nil {
				return nil, fmt.Errorf("could not parse folder ID, err: %w", err)
			}
			vault.FolderID = &folderID
		} else {
			vault.FolderID = nil
		}
		if err := json.Unmarshal([]byte(signers), &vault.Signers); err != nil {
			return nil, fmt.Errorf("could not unmarshal signers, err: %w", err)
		}
		keyShares, err := s.getKeyShares(vault.PublicKeyECDSA)
		if err != nil {
			return nil, fmt.Errorf("could not get keyshares, err: %w", err)
		}
		vault.KeyShares = keyShares
		coins, err := s.GetCoins(vault.PublicKeyECDSA)
		if err != nil {
			return nil, fmt.Errorf("could not get coins, err: %w", err)
		}
		vault.Coins = coins

		vaults = append(vaults, &vault)
	}
	return vaults, nil
}


// DeleteVault deletes a vault
func (s *Store) DeleteVault(publicKeyECDSA string) error {
	_, err := s.db.Exec("DELETE FROM vaults WHERE public_key_ecdsa = ?", publicKeyECDSA)
	return err
}

func (s *Store) GetCoins(vaultPublicKeyECDSA string) ([]Coin, error) {
	var coins []Coin
	coinsQuery := `SELECT id, chain, address, hex_public_key, ticker, contract_address, is_native_token, logo, price_provider_id, decimals FROM coins WHERE public_key_ecdsa = ?`
	coinsRows, err := s.db.Query(coinsQuery, vaultPublicKeyECDSA)
	if err != nil {
		return nil, fmt.Errorf("could not query coins: %w", err)
	}
	defer s.closeRows(coinsRows)

	for coinsRows.Next() {
		var coin Coin
		if err := coinsRows.Scan(&coin.ID,
			&coin.Chain,
			&coin.Address,
			&coin.HexPublicKey,
			&coin.Ticker,
			&coin.ContractAddress,
			&coin.IsNativeToken,
			&coin.Logo,
			&coin.PriceProviderID,
			&coin.Decimals,
		); err != nil {
			return nil, fmt.Errorf("could not scan coin: %w", err)
		}
		coins = append(coins, coin)
	}

	if err = coinsRows.Err(); err != nil {
		return nil, fmt.Errorf("error occurred during iteration of rows: %w", err)
	}

	return coins, nil
}

// Settings is for all vaults, so no need to pass public key ecdsa
func (s *Store) SaveSettings(setting Settings) (*Settings, error) {

	// Set default values if null
	if setting.Language == "" {
		setting.Language = "English"
	}

	if setting.Currency == "" {
		setting.Currency = "USD"
	}

	// Delete existing settings
	deleteQuery := "DELETE FROM settings"
	_, err := s.db.Exec(deleteQuery)
	if err != nil {
		return nil, fmt.Errorf("could not delete settings, err: %w", err)
	}

	// Insert new settings
	insertQuery := `INSERT INTO settings (
				language,
				currency,
				default_chains
			) VALUES (?, ?, ?);`

	if setting.DefaultChains == nil {
		setting.DefaultChains = []string{}
	}

	var stringDefaultChain string
	if len(setting.DefaultChains) > 0 {
		for i, chain := range setting.DefaultChains {
			chain = strings.TrimSpace(chain)
			setting.DefaultChains[i] = chain
		}
		stringDefaultChain = strings.Join(setting.DefaultChains, ",")
	}

	_, err = s.db.Exec(insertQuery, setting.Language, setting.Currency, stringDefaultChain)
	if err != nil {
		return nil, fmt.Errorf("could not insert settings, err: %w", err)
	}

	settings, err := s.GetSettings()
	if err != nil {
		return nil, fmt.Errorf("could not get settings, err: %w", err)
	}

	if len(settings) == 0 {
		return nil, fmt.Errorf("could not get settings")
	}

	latestSetting := settings[0]

	return &latestSetting, nil
}

// GetSettings retrieves all settings from the database.
func (s *Store) GetSettings() ([]Settings, error) {
	var settings []Settings
	query := `SELECT language, currency, default_chains FROM settings`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query the settings, err: %w", err)
	}
	defer s.closeRows(rows)

	for rows.Next() {
		var (
			language      string
			currency      string
			defaultChains string
		)

		if err := rows.Scan(
			&language,
			&currency,
			&defaultChains,
		); err != nil {
			return nil, fmt.Errorf("could not scan settings, err: %w", err)
		}

		// Split the defaultChains string into an array
		chainArray := []string{}
		if defaultChains != "" {
			chainArray = strings.Split(defaultChains, ",")
		}

		setting := Settings{
			Language:      language,
			Currency:      currency,
			DefaultChains: chainArray,
		}

		settings = append(settings, setting)
	}
	return settings, nil
}

func (s *Store) SaveAddressBookItem(item AddressBookItem) (string, error) {
	if item.ID == uuid.Nil {
		item.ID = uuid.New()
	}
	query := `INSERT OR REPLACE INTO address_book (id, title, address, chain, "order") VALUES (?, ?, ?, ?, ?)`
	_, err := s.db.Exec(query, item.ID, item.Title, item.Address, item.Chain, item.Order)
	if err != nil {
		return "", fmt.Errorf("could not upsert address book item, err: %w", err)
	}
	return item.ID.String(), nil
}

// Delete address book item by id
func (s *Store) DeleteAddressBookItem(id string) error {
	query := `DELETE FROM address_book WHERE id = ?`
	_, err := s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("could not delete address book item, err: %w", err)
	}
	return nil
}

// Update address book item by id
func (s *Store) UpdateAddressBookItem(item AddressBookItem) error {
	query := `UPDATE address_book SET title = ?, address = ?, chain = ?, "order" = ? WHERE id = ?`
	_, err := s.db.Exec(query, item.Title, item.Address, item.Chain, item.Order, item.ID)
	if err != nil {
		return fmt.Errorf("could not update address book item, err: %w", err)
	}
	return nil
}

// Get all address book items
func (s *Store) GetAllAddressBookItems() ([]AddressBookItem, error) {
    query := `SELECT id, title, address, chain, "order" FROM address_book`
    rows, err := s.db.Query(query)
    if err != nil {
        return nil, fmt.Errorf("could not query address book, err: %w", err)
    }
    defer s.closeRows(rows)

    var addressBookItems []AddressBookItem
    for rows.Next() {
        var addressBookItem AddressBookItem
        if err := rows.Scan(&addressBookItem.ID, &addressBookItem.Title, &addressBookItem.Address, &addressBookItem.Chain, &addressBookItem.Order); err != nil {
            return nil, fmt.Errorf("could not scan address book item, err: %w", err)
        }
        addressBookItems = append(addressBookItems, addressBookItem)
    }

    return addressBookItems, nil

}

func (s *Store) GetAddressBookItems(chain string) ([]AddressBookItem, error) {
	query := `SELECT id, title, address, chain, "order" FROM address_book WHERE chain = ?`
	rows, err := s.db.Query(query, chain)
	if err != nil {
		return nil, fmt.Errorf("could not query address book, err: %w", err)
	}
	defer s.closeRows(rows)

	var addressBookItems []AddressBookItem
	for rows.Next() {
		var addressBookItem AddressBookItem
		if err := rows.Scan(&addressBookItem.ID, &addressBookItem.Title, &addressBookItem.Address, &addressBookItem.Chain, &addressBookItem.Order); err != nil {
			return nil, fmt.Errorf("could not scan address book item, err: %w", err)
		}
		addressBookItems = append(addressBookItems, addressBookItem)
	}

	return addressBookItems, nil

}

func (s *Store) DeleteCoin(vaultPublicKeyECDSA, coinID string) error {
	_, err := s.db.Exec("DELETE FROM coins WHERE id = ? AND public_key_ecdsa = ?", coinID, vaultPublicKeyECDSA)
	return err
}

func (s *Store) SaveCoin(vaultPublicKeyECDSA string, coin Coin) (string, error) {
	if coin.ID == "" {
		coin.ID = uuid.New().String()
	}
	query := `INSERT OR REPLACE INTO coins (
				id, 
				chain, 
				address,
				hex_public_key, 
				ticker, 
				contract_address, 
				is_native_token, 
				logo, 
				price_provider_id,
				decimals,
				public_key_ecdsa
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := s.db.Exec(query, coin.ID, coin.Chain, coin.Address, coin.HexPublicKey, coin.Ticker, coin.ContractAddress, coin.IsNativeToken, coin.Logo, coin.PriceProviderID, coin.Decimals, vaultPublicKeyECDSA)
	if err != nil {
		return "", fmt.Errorf("could not upsert coin, err: %w", err)
	}
	return coin.ID, nil
}

func (s *Store) SaveVaultFolder(folder *VaultFolder) (string, error) {
	if folder.ID == uuid.Nil {
		folder.ID = uuid.New()
	}
	query := `INSERT OR REPLACE INTO vault_folders (id, title, "order") VALUES (?, ?, ?)`
	_, err := s.db.Exec(query, folder.ID.String(), folder.Title, folder.Order)
	if err != nil {
		return "", fmt.Errorf("could not upsert vault folder, err: %w", err)
	}
	return folder.ID.String(), nil
}

func (s *Store) GetVaultFolder(id string) (*VaultFolder, error) {
	query := `SELECT id, title, "order" FROM vault_folders WHERE id = ?`
	row := s.db.QueryRow(query, id)
	var (
		folder   VaultFolder
		folderID string
		err      error
	)
	if err = row.Scan(&folderID, &folder.Title, &folder.Order); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("vault folder not found")
		}
		return nil, fmt.Errorf("could not scan vault folder, err: %w", err)
	}
	folder.ID, err = uuid.Parse(folderID)
	if err != nil {
		return nil, fmt.Errorf("could not parse folder ID, err: %w", err)
	}
	return &folder, nil
}

func (s *Store) GetVaultFolders() ([]*VaultFolder, error) {
	query := `SELECT id, title, "order" FROM vault_folders ORDER BY "order"`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query vault folders, err: %w", err)
	}
	defer s.closeRows(rows)

	var folders []*VaultFolder
	for rows.Next() {
		var folder VaultFolder
		var folderID string
		if err := rows.Scan(&folderID, &folder.Title, &folder.Order); err != nil {
			return nil, fmt.Errorf("could not scan vault folder, err: %w", err)
		}
		folder.ID, err = uuid.Parse(folderID)
		if err != nil {
			return nil, fmt.Errorf("could not parse folder ID, err: %w", err)
		}
		folders = append(folders, &folder)
	}
	return folders, nil
}

func (s *Store) UpdateVaultFolder(folder *VaultFolder) error {
	query := `UPDATE vault_folders SET title = ?, "order" = ? WHERE id = ?`
	_, err := s.db.Exec(query, folder.Title, folder.Order, folder.ID.String())
	if err != nil {
		return fmt.Errorf("could not update vault folder, err: %w", err)
	}
	return nil
}

func (s *Store) DeleteVaultFolder(id string) error {
	_, err := s.db.Exec("DELETE FROM vault_folders WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("could not delete vault folder, err: %w", err)
	}
	return nil
}

// Close the db connection
func (s *Store) Close() error {
	return s.db.Close()
}
