package main

import (
	"context"
	"encoding/base64"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx  context.Context
	args []string
}

func NewApp(args []string) *App {
	return &App{
		args: args,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) SaveFileBkp(suggestedFilename string, base64Data string) (bool, error) {
    filename, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
        Title:           "Save File",
        Filters:         []runtime.FileFilter{{DisplayName: "All Files(*)", Pattern: "*.bak;*.dat;*.vult"}},
        DefaultFilename: suggestedFilename,
    })
    if err != nil {
        return false, err
    }

    if filename == "" {
        // User canceled the dialog
        return false, nil
    }

    err = os.WriteFile(filename, []byte(base64Data), 0644)
    if err != nil {
        return false, err
    }

    return true, nil
}

func (a *App) GetOSArgs() []string {
	return a.args
}

func (a *App) ReadTextFile(filename string) (string, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}

	return string(data), nil
}


func (a *App) SaveFile(suggestedFilename string, base64Data string) (string, error) {
	filename, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title: "Save File",
		Filters: []runtime.FileFilter{
			{DisplayName: "All Supported Files (*.png;*.bak;*.dat;*.vult)", Pattern: "*.png;*.bak;*.dat;*.vult"},
		},
		DefaultFilename: suggestedFilename,
	})
	if err != nil {
		return "", err
	}

	if filename == "" {
		// User canceled the dialog
		return "", nil
	}

	// Decode base64 data
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", err
	}

	// Write the data to the file
	err = os.WriteFile(filename, data, 0644)
	if err != nil {
		return "", err
	}

	return filename, nil
}
