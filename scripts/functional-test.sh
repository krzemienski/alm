#!/usr/bin/env bash
set -euo pipefail
API=http://localhost:8000

echo "Running functional tests against $API"

# Wait for health
echo "Waiting for API to become available..."
until curl -sf "$API/health" >/dev/null; do
  echo "."
  sleep 1
done
echo "API is up and running"

# T-01 Import parity
echo "T-01: Testing import parity"
read -r LID CNT_MD <<< $(curl -sf -X POST "$API/import" \
  -H 'Content-Type: application/json' \
  -d '{"repoUrl":"https://github.com/krzemienski/awesome-video"}' | jq -r '.listId,.itemCount')
echo "Imported list ID: $LID with $CNT_MD items"
CNT_DB=$(curl -sf "$API/lists/$LID" | jq '.items|length')
echo "Database contains $CNT_DB items"
if [[ "$CNT_MD" == "$CNT_DB" ]]; then
  echo "T-01: PASS - Import counts match"
else
  echo "T-01: FAIL - Import counts do not match: MD=$CNT_MD DB=$CNT_DB"
  exit 1
fi

# T-02 CRUD operations
echo "T-02: Testing CRUD operations"
# Create a new category
CAT_ID=$(curl -sf -X POST "$API/categories" \
  -H 'Content-Type: application/json' \
  -d "{\"listId\":\"$LID\",\"name\":\"Test Category\",\"description\":\"Test category description\"}" | jq -r '.id')
echo "Created category ID: $CAT_ID"

# Create a new item in the category
ITEM_ID=$(curl -sf -X POST "$API/items" \
  -H 'Content-Type: application/json' \
  -d "{\"listId\":\"$LID\",\"categoryId\":\"$CAT_ID\",\"name\":\"Test Item\",\"url\":\"https://example.com\",\"description\":\"Test item description\"}" | jq -r '.id')
echo "Created item ID: $ITEM_ID"

# Update the item
curl -sf -X PUT "$API/items/$ITEM_ID" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Updated Test Item\",\"url\":\"https://example.com\",\"description\":\"Updated test item description\"}" > /dev/null
echo "Updated item"

# Verify the update
UPDATED_NAME=$(curl -sf "$API/items/$ITEM_ID" | jq -r '.name')
if [[ "$UPDATED_NAME" == "Updated Test Item" ]]; then
  echo "T-02: PASS - Item update successful"
else
  echo "T-02: FAIL - Item update failed"
  exit 1
fi

# Delete the item
curl -sf -X DELETE "$API/items/$ITEM_ID" > /dev/null
echo "Deleted item"

# Delete the category
curl -sf -X DELETE "$API/categories/$CAT_ID" > /dev/null
echo "Deleted category"

# T-03 Export round-trip
echo "T-03: Testing export functionality"
EXPORT_CONTENT=$(curl -sf "$API/export/$LID")
if [[ "$EXPORT_CONTENT" == *"# Awesome Video"* ]]; then
  echo "T-03: PASS - Export contains valid content"
else
  echo "T-03: FAIL - Export content invalid"
  exit 1
fi

# T-04 UI smoke test would be done with Playwright in a separate test

echo "All tests passed successfully!"
