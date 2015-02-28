#!/usr/bin/env bash
# Install DNS update cron

BOTHOME_DIR=$( cd "$( dirname $( dirname "${BASH_SOURCE[0]}" ) )" && pwd )
CRON_NAME="#DDNS_update_cron"

CRON_TIME="1,6,11,16,21,26,31,36,41,46,51,56 * * * * sleep 43"
DDNS_CMD="$BOTHOME_DIR/bin/update_ddns.sh"
LOGPATH="$BOTHOME_DIR/logs"

mkdir -p $LOGPATH
DDNS_CRON="$CRON_TIME ; $DDNS_CMD >> $LOGPATH/cron_DNS.log 2>&1 &"

echo "Adding DDNS cron to crontab:"
echo "$DDNS_CMD"
echo "$CRON_NAME ;" >> temp_cron
echo "$DDNS_CRON" >> temp_cron
crontab temp_cron
rm temp_cron
