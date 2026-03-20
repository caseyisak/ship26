# Common Errors

## Common Errors

**"Field value must include locale"**
- Every field value needs `{ "en-US": value }` wrapper
- Even boolean: `{ "en-US": true }` not just `true`

**"Content type not found"**
- The content type must be published before creating entries
- Check the contentTypeId matches exactly (case-sensitive)

**"Invalid link"**
- The linked entry must exist and be published
- Check the entry ID is correct
- For reference arrays, use the full link structure

**"Validation failed"**
- Check the linked content type is allowed in the field's validations
- Check required fields are provided
