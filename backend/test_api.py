import requests

url = "http://localhost:8000/auth/token"
data = {
    "username": "test@test.com",
    "password": "12345"
}
headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

try:
    response = requests.post(url, data=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
