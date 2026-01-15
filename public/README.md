# Public Directory

This directory contains static assets that are served at the root of the application.

## useful_data

The `useful_data` directory is a copy of the reference data files from the root `useful_data` directory. These files are used by the data loader module to provide accurate text encoding, Pokémon names, and experience tables for all three generations.

### Maintenance

The `public/useful_data` directory should be kept in sync with the root `useful_data` directory. When updating reference data:

1. Update the files in the root `useful_data` directory
2. Copy them to `public/useful_data`:
   ```bash
   cp -r useful_data/* public/useful_data/
   ```

### Build Process

During the build process, Vite automatically copies all files from the `public` directory to the `dist` directory, making them accessible at runtime via HTTP requests (e.g., `/useful_data/Gen1/text_conv.txt`).
