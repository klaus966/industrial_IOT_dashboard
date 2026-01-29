import requests

base_url = "http://localhost:8000"
username = "admin@example.com"
password = "password123"

# 1. Login
try:
    auth_resp = requests.post(
        f"{base_url}/auth/token",
        data={"username": username, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print(f"Login Status: {auth_resp.status_code}")
    if auth_resp.status_code != 200:
        print(f"Login Failed: {auth_resp.text}")
        exit(1)
        
    token = auth_resp.json()["access_token"]
    print(f"Token received: {token[:10]}...")
    
    # 2. Access Protected Route
    headers = {"Authorization": f"Bearer {token}"}
    machines_resp = requests.get(f"{base_url}/machines", headers=headers)
    
    print(f"Machines Status: {machines_resp.status_code}")
    if machines_resp.status_code == 200:
        print(f"Machines Data: {machines_resp.json()}")
    else:
        print(f"Machines Failed: {machines_resp.text}")

except Exception as e:
    print(f"Error: {e}")
