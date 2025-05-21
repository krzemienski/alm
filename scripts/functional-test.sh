#!/usr/bin/env bash
set -euo pipefail
API=http://localhost:8001

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
echo "Sending POST request to $API/import"
IMPORT_RESPONSE=$(curl -sf -X POST "$API/import" \
  -H 'Content-Type: application/json' \
  -d '{"repoUrl":"https://github.com/krzemienski/awesome-video"}')
echo "Import response: $IMPORT_RESPONSE"

# Extract list ID
LIST_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.list_id // .listId')
if [ -z "$LIST_ID" ] || [ "$LIST_ID" = "null" ]; then
  echo "T-01: FAIL - Could not extract list ID from import response"
  exit 1
fi
echo "Successfully imported list with ID: $LIST_ID"
echo "T-01: PASS - Import successful"

# T-02 CRUD operations
echo "T-02: Testing CRUD operations"

# Create a category
echo "Creating a new category"
CATEGORY_RESPONSE=$(curl -sf -X POST "$API/categories/" \
  -H 'Content-Type: application/json' \
  -d "{\"list_id\":\"$LIST_ID\",\"name\":\"Test Category\",\"description\":\"A test category for awesome items\"}")
CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.id')
if [ -z "$CATEGORY_ID" ] || [ "$CATEGORY_ID" = "null" ]; then
  echo "T-02: FAIL - Could not create category"
  exit 1
fi
echo "Successfully created category with ID: $CATEGORY_ID"

# Create an item
echo "Creating a new item"
ITEM_RESPONSE=$(curl -sf -X POST "$API/items/" \
  -H 'Content-Type: application/json' \
  -d "{\"list_id\":\"$LIST_ID\",\"category_id\":\"$CATEGORY_ID\",\"name\":\"Test Item\",\"url\":\"https://example.com\",\"description\":\"A test item description\"}")
ITEM_ID=$(echo "$ITEM_RESPONSE" | jq -r '.id')
if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
  echo "T-02: FAIL - Could not create item"
  exit 1
fi
echo "Successfully created item with ID: $ITEM_ID"

# Get category
echo "Getting category"
CATEGORY_GET_RESPONSE=$(curl -sf "$API/categories/$CATEGORY_ID")
CATEGORY_NAME=$(echo "$CATEGORY_GET_RESPONSE" | jq -r '.name')
if [ "$CATEGORY_NAME" != "Test Category" ]; then
  echo "T-02: FAIL - Category retrieval failed or wrong data"
  exit 1
fi
echo "Successfully retrieved category: $CATEGORY_NAME"

# Update category
echo "Updating category"
curl -sf -X PUT "$API/categories/$CATEGORY_ID" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated Test Category"}'
CATEGORY_GET_RESPONSE=$(curl -sf "$API/categories/$CATEGORY_ID")
CATEGORY_NAME=$(echo "$CATEGORY_GET_RESPONSE" | jq -r '.name')
if [ "$CATEGORY_NAME" != "Updated Test Category" ]; then
  echo "T-02: FAIL - Category update failed"
  exit 1
fi
echo "Successfully updated category to: $CATEGORY_NAME"

# Update item
echo "Updating item"
curl -sf -X PUT "$API/items/$ITEM_ID" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Updated Test Item","description":"Updated description"}'
ITEM_GET_RESPONSE=$(curl -sf "$API/items/$ITEM_ID")
ITEM_NAME=$(echo "$ITEM_GET_RESPONSE" | jq -r '.name')
ITEM_DESC=$(echo "$ITEM_GET_RESPONSE" | jq -r '.description')
if [ "$ITEM_NAME" != "Updated Test Item" ] || [ "$ITEM_DESC" != "Updated description" ]; then
  echo "T-02: FAIL - Item update failed"
  exit 1
fi
echo "Successfully updated item to: $ITEM_NAME"

# Delete item
echo "Deleting item"
DELETE_ITEM_RESPONSE=$(curl -sf -X DELETE "$API/items/$ITEM_ID")
if [ "$(echo "$DELETE_ITEM_RESPONSE" | jq -r '.ok')" != "true" ]; then
  echo "T-02: FAIL - Item deletion failed"
  exit 1
fi
echo "Successfully deleted item"

# Delete category
echo "Deleting category"
DELETE_CATEGORY_RESPONSE=$(curl -sf -X DELETE "$API/categories/$CATEGORY_ID")
if [ "$(echo "$DELETE_CATEGORY_RESPONSE" | jq -r '.ok')" != "true" ]; then
  echo "T-02: FAIL - Category deletion failed"
  exit 1
fi
echo "Successfully deleted category"

echo "T-02: PASS - All CRUD operations successful"

# T-03 Export functionality
echo "T-03: Testing export functionality"
EXPORT_CONTENT=$(curl -sf "$API/export/$LIST_ID")

# Check for essential content in the export
if [[ "$EXPORT_CONTENT" == *"Awesome Video"* ]]; then
  echo "Export contains title: Awesome Video"
  echo "T-03: PASS - Export contains valid content"
else
  echo "T-03: FAIL - Export content invalid"
  exit 1
fi

echo "All tests passed successfully!"
exit 0
