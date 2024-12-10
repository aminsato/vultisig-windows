// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import { storage } from '../models';

export function Close(): Promise<void>;

export function DeleteAddressBookItem(arg1: string): Promise<void>;

export function DeleteCoin(arg1: string, arg2: string): Promise<void>;

export function DeleteVault(arg1: string): Promise<void>;

export function DeleteVaultFolder(arg1: string): Promise<void>;

export function GetAddressBookItems(
  arg1: string
): Promise<Array<storage.AddressBookItem>>;

export function GetAllAddressBookItems(): Promise<
  Array<storage.AddressBookItem>
>;

export function GetCoins(arg1: string): Promise<Array<storage.Coin>>;

export function GetSettings(): Promise<Array<storage.Settings>>;

export function GetVault(arg1: string): Promise<storage.Vault>;

export function GetVaultFolder(arg1: string): Promise<storage.VaultFolder>;

export function GetVaultFolders(): Promise<Array<storage.VaultFolder>>;

export function GetVaults(): Promise<Array<storage.Vault>>;

export function Migrate(): Promise<void>;

export function SaveAddressBookItem(
  arg1: storage.AddressBookItem
): Promise<string>;

export function SaveCoin(arg1: string, arg2: storage.Coin): Promise<string>;

export function SaveSettings(arg1: storage.Settings): Promise<storage.Settings>;

export function SaveVault(arg1: storage.Vault): Promise<void>;

export function SaveVaultFolder(arg1: storage.VaultFolder): Promise<string>;

export function UpdateAddressBookItem(
  arg1: storage.AddressBookItem
): Promise<void>;

export function UpdateVaultFolder(arg1: storage.VaultFolder): Promise<void>;

export function UpdateVaultFolderID(arg1: string, arg2: any): Promise<void>;

export function UpdateVaultFolderName(
  arg1: string,
  arg2: string
): Promise<void>;

export function UpdateVaultFolderOrder(
  arg1: string,
  arg2: number
): Promise<void>;

export function UpdateVaultIsBackedUp(
  arg1: string,
  arg2: boolean
): Promise<void>;

export function UpdateVaultName(arg1: string, arg2: string): Promise<void>;

export function UpdateVaultOrder(arg1: string, arg2: number): Promise<void>;
