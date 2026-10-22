#!/bin/bash

set -e
echo "starting server"
node /ci/.next/standalone/apps/commons/server.js
