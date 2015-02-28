#!/usr/bin/env bash
BOTHOME_DIR=$( cd "$( dirname $( dirname "${BASH_SOURCE[0]}" ) )" && pwd )
cd $BOTHOME_DIR

config() {
    /usr/local/bin/node $BOTHOME_DIR/bin/get_config.js $1
}

DDNS_KEY=$(config freedns_key)

if [ -z "$DDNS_KEY" ] || [[ $DDNS_KEY == *"The key from freedns to update the DSS record"* ]] 
then
    echo "FreeDNS key not found or undefined"
    exit 1;
fi

echo "Updating DDNS IP with FreeDNS"
DDNS_CMD="wget -O - http://freedns.afraid.org/dynamic/update.php?$DDNS_KEY"
echo "$DDNS_CMD"
$DDNS_CMD
