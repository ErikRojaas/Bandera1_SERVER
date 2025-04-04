#!/bin/bash

# Usage: ./upload.sh [user] [rsa_path] [port] [local_file] [remote_path]
source config.env

USER="${1:-$DEFAULT_USER}"
RSA_PATH="${2:-$DEFAULT_RSA_PATH}"
PORT="${3:-$DEFAULT_SERVER_PORT}"
LOCAL_FILE="${4}"
REMOTE_PATH="${5}"

if [ -z "$LOCAL_FILE" ] || [ -z "$REMOTE_PATH" ]; then
    echo "Usage: $0 [user] [rsa_path] [port] [local_file] [remote_path]"
    exit 1
fi

if [ ! -f "$RSA_PATH" ]; then
    echo "Error: Private key not found at $RSA_PATH"
    exit 1
fi

# Check if the file exists on the remote server
EXISTS=$(ssh -i "$RSA_PATH" -p "$PORT" "$USER@ieticloudpro.ieti.cat" "test -e '$REMOTE_PATH' && echo EXISTS || echo NOT_EXISTS")

if [ "$EXISTS" = "EXISTS" ]; then
    read -p "El fitxer ja existeix. Vols sobreescriure'l? (s/n): " ANSWER
    if [ "$ANSWER" != "s" ]; then
        echo "Cancel·lat per l'usuari."
        exit 0
    fi
fi

# Upload the file
scp -i "$RSA_PATH" -P "$PORT" "$LOCAL_FILE" "$USER@ieticloudpro.ieti.cat:$REMOTE_PATH"

echo "Fitxer pujat correctament."
