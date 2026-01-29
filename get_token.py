import requests

base_url = "http://localhost:8000"
username = "admin@example.com"
password = "password123"

try:
    auth_resp = requests.post(
        f"{base_url}/auth/token",
        data={"username": username, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if auth_resp.status_code == 200:
        with open("token.txt", "w") as f:
            f.write(auth_resp.json()["access_token"])
        print("Token written to token.txt")
    else:
        print(f"Error: {auth_resp.text}")
except Exception as e:
    print(f"Exception: {e}")
