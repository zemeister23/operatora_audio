# Installing Node.js on Windows

## Method 1: Official Installer (Recommended)

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - Choose the Windows Installer (.msi) for your system (64-bit recommended)

2. **Run the Installer:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - **Important:** Check the box "Automatically install the necessary tools" if prompted
   - Click "Next" through the installation steps
   - Click "Install" (you may need administrator privileges)

3. **Verify Installation:**
   - Open a new PowerShell or Command Prompt window
   - Run:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers for both

## Method 2: Using Chocolatey (Package Manager)

If you have Chocolatey installed:

```powershell
choco install nodejs-lts
```

## Method 3: Using Winget (Windows Package Manager)

If you have Windows 10/11 with winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

## After Installation

1. **Restart your terminal/PowerShell** to ensure PATH is updated

2. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

3. **Install project dependencies:**
   ```bash
   cd C:\Users\WESOLVE\Desktop\work\operatora_audio
   npm install
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

## Troubleshooting

- **"node is not recognized"**: Restart your terminal/PowerShell after installation
- **Permission errors**: Run PowerShell as Administrator
- **Old version**: Uninstall the old version first, then install the latest LTS

## Recommended Version

- **Node.js LTS** (currently v20.x or v18.x) - Recommended for stability
- **npm** comes bundled with Node.js automatically
