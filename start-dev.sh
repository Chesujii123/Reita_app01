#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/bin:$PATH"
exec "/opt/homebrew/bin/node" "/Users/chesujii/Claude_Code/reita_app/node_modules/.bin/next" dev --port 3000
