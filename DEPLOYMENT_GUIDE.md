# Ultimate Deployment Checklist (Local Network)

Follow these exact steps to deploy the CVNHS Electronic Research Library on your server computer so it runs 24/7 and is accessible to all users on your local network.

---

## 🟢 PHASE 1: Prepare the Server Machine
Before moving any project files, make sure the server has these installed:

1.  **Node.js (LTS Version)**: [Download here](https://nodejs.org/).
2.  **MongoDB Community Server**: [Download here](https://www.mongodb.com/try/download/community).
    *   During installation, ensure "Install MongoDB as a Service" is checked.
3.  **Find & Fix the Server IP**: 
    *   On the server machine, open Command Prompt and type `ipconfig`.
    *   Look for "IPv4 Address" (e.g., `192.168.1.10`), "Subnet Mask" (e.g., `255.255.255.0`), and "Default Gateway" (e.g., `192.168.1.1`). **Write these down.**
    *   **How to Set a Static IP (Windows)**:
        1. Open **Control Panel** > **Network and Sharing Center** > **Change adapter settings**.
        2. Right-click your network (WiFi or Ethernet) and select **Properties**.
        3. Select **Internet Protocol Version 4 (TCP/IPv4)** and click **Properties**.
        4. Select **Use the following IP address** and enter the numbers you wrote down earlier.
        5. For **Preferred DNS server**, you can use Google's: `8.8.8.8`.
        6. Click **OK** and restart the computer.
    *   **Why?**: If you don't do this, the IP might change when you restart the router, and users won't be able to find the website.

---

## 🔵 PHASE 2: Build & Transfer Files
On your **Development Machine** (the computer you used to write the code):

1.  **Build the Frontend**:
    ```bash
    cd frontend
    npm run build
    ```
2.  **Prepare the "Deployment" Folder**:
    Create a folder named `CVNHS_Library` on a USB drive or shared drive.
3.  **Copy these specific files into it**:
    *   📁 `backend/` folder (Copy everything **EXCEPT** `node_modules`).
    *   📁 `dist/` folder (From inside your `frontend/` folder).

**Your server folder structure should look like this:**
```text
C:\CVNHS_Library\
├── backend\
│   ├── models\          <-- (Required for DB schemas)
│   ├── server.js        <-- (Main app logic)
│   ├── .env             <-- (Settings)
│   ├── package.json
│   └── package-lock.json
└── frontend\
    └── dist\            <-- (The built UI files)
```

---

## 🟡 PHASE 3: Configuration (The .env file)
On the **Server Machine**, open `C:\CVNHS_Library\backend\.env` and set these values:

```env
# OPTION A: No Authentication (Default for new local installs)
MONGO_URI=mongodb://localhost:27017/cvnhs_research_library

# OPTION B: With Authentication (If you set a username/password in MongoDB)
# MONGO_URI=mongodb://[USER]:[PASSWORD]@localhost:27017/cvnhs_research_library?authSource=admin

# Port for the website (5000 is recommended)
PORT=5000

# Security (Change this to any random long string)
SESSION_SECRET=a_very_long_random_and_secure_string_12345
```

---

## 🟠 PHASE 4: Install Dependencies & Run
On the **Server Machine**, open a terminal (Command Prompt) inside the `C:\CVNHS_Library\backend` folder:

1.  **Install Production Libraries**:
    ```bash
    npm install --production
    ```
2.  **Test the Server**:
    ```bash
    node server.js
    ```
    *   If it says "Connected to MongoDB" and "Server running on port 5000", it works!
    *   *Note: On the first run, it will automatically create the database and a default admin (Username: `admin`, Password: `admin`).*

---

## 🔴 PHASE 5: Automatic Startup (24/7 Running)
To make the server start automatically when the computer turns on:

1.  **Install PM2 Globally**:
    You can run this from **ANY** directory in your terminal. The `-g` means it installs system-wide like a program.
    ```bash
    npm install -g pm2
    npm install -g pm2-windows-startup
    ```
2.  **Register Startup**:
    You can also run this from **ANY** directory. It tells Windows to load PM2 when the computer boots up.
    ```bash
    pm2-startup install
    ```
3.  **Start and Save**:
    **CRITICAL**: You must navigate the terminal into the `backend` folder first:
    ```bash
    # Step 1: Navigate to the folder in the terminal
    cd C:\CVNHS_Library\backend

    # Step 2: Tell PM2 to start your server
    pm2 start server.js --name "cvnhs-library"

    # Step 3: Save the list of running apps
    pm2 save
    ```

Now, even if you restart the computer, the website will start by itself.

---

## ❌ UNDO Phase 5: How to Stop Automatic Startup
If you decide you **don't** want the server to start automatically anymore, you can run these commands from **ANY** directory:

1.  **Stop the Auto-Loader**:
    ```bash
    pm2-startup uninstall
    ```

2.  **Remove the App from PM2**:
    ```bash
    pm2 delete "cvnhs-library"
    pm2 save
    ```

3.  **Kill PM2 (Optional)**:
    If you want to completely stop everything:
    ```bash
    pm2 kill
    ```

---

## ⚪ PHASE 6: Accessing the Website
Users on the same WiFi/Network can now access the site at:
`http://[SERVER_IP_ADDRESS]:5000`

### ⚠️ IMPORTANT: Firewall Setting
If others **cannot** access the site, you need to open Port 5000 in your Windows Firewall:
1. Search for "Windows Defender Firewall with Advanced Security".
2. Click **Inbound Rules** > **New Rule**.
3. Select **Port** > **TCP** > **Specific local ports: 5000**.
4. Select **Allow the connection** and click Finish.

---

## 📁 File Storage (PDFs)
Uploaded PDFs will be saved on the server at:
`%APPDATA%/cvnhs_electronic_research_library/cvnhs_research_papers/`
*(You can type `%APPDATA%` in File Explorer to find this folder).*

---

## 🛠️ Internal Optimizations Applied
- **[server.js](file:///c:/Cursor/cvnhs_electronic_research_library/backend/server.js)**: Optimized to serve the frontend automatically. (Compatible with Express 5.0+ using `app.use` middleware catch-all).
