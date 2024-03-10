# UUID v9

The v9 UUID supports both time-based sequential and random non-sequential UUIDs with an optional prefix, an optional checksum, and sufficient randomness to avoid collisions. It uses the UNIX timestamp for sequential UUIDs and CRC-8 for checksums. A version digit can be added if desired, but is omitted by default.

<!-- To learn more about UUID v9, please visit the website: https://uuid-v9.jhunt.dev -->

## Installation

Install UUID v9 from npm

With npm:
```bash
npm install --save uuid-v9
```
or using yarn:
```bash
yarn add uuid-v9
```

## Usage

```javascript
import uuid, { validateUUID, UUIDGenerator } from 'uuid-v9' 

const orderedId = uuid()
const prefixedOrderedId = uuid('a1b2c3d4') // up to 8 hexadecimal characters
const unorderedId = uuid('', false)
const prefixedUnorderedId = uuid('a1b2c3d4', false)
const orderedIdWithChecksum = uuid('', true, true)
const orderedIdWithVersion = uuid('', true, false, true)
const orderedIdWithCompatibility = uuid('', true, false, false, true)

const isValid = validateUUID(orderedId) // built-in UUID validator
const isValidWithChecksum = validate_uuid(orderedIdWithChecksum, true)
const isValidWithVersion = validate_uuid(orderedIdWithVersion, true, true)
const isValidWithCompatibility = validate_uuid(orderedIdWithCompatibility, true, '1')

const makeMyId = UUIDGenerator({
    prefix: '',
    timestamp: true,
    checksum: true,
    version: false,
    compatible: true
})

const myId = makeMyId() // uses defaults specified in createUUIDGenerator
const myIdCustom = makeMyId('a1b2c3d4', false) // overrides defaults
```

## Compatibility

Some UUID validators will not accept some v9 UUIDs. Three possible workarounds are:

1) Use the built-in validator (recommended)
2) Use compatibility mode*
3) Bypass the validator (not recommended)

_*Compatibility mode adds version and variant digits to immitate v1 or v4 UUIDs based on whether or not you have a timestamp._

## Format

Here is the UUID v9 format: `xxxxxxxx-xxxx-9xxx-8xxx-xxxxxxxxxxyy`

x = prefix/timestamp/random, y = checksum (optional), 9 = version (optional), 8 = variant (compatibility mode)

## License

This project is licensed under the [MIT License](LICENSE).