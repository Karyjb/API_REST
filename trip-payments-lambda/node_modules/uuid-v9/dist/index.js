"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDGenerator = exports.validateUUID = exports.verifyChecksum = void 0;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function calcChecksum(hexString) {
    const data = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    const polynomial = 0x07;
    let crc = 0x00;
    for (const byte of data) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x80) {
                crc = (crc << 1) ^ polynomial;
            }
            else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFF).toString(16).padStart(2, '0');
}
const verifyChecksum = (uuid) => {
    const base16String = uuid.replace(/-/g, '').substring(0, 30);
    const crc = calcChecksum(base16String);
    return crc === uuid.substring(34, 36);
};
exports.verifyChecksum = verifyChecksum;
const validateUUID = (uuid, checksum = false, version = false) => (typeof uuid === 'string' &&
    uuidRegex.test(uuid) &&
    (!checksum || (0, exports.verifyChecksum)(uuid)) &&
    (!version ||
        (version === true && uuid.slice(14, 15) === '9') ||
        (uuid.slice(14, 15) === String(version) &&
            ('14'.indexOf(String(version)) === -1 || '89abAB'.indexOf(uuid.slice(19, 20)) > -1))));
exports.validateUUID = validateUUID;
const randomBytes = (count) => {
    let str = '';
    for (let i = 0; i < count; i++) {
        const r = (Math.random() * 16) | 0;
        str += r.toString(16);
    }
    return str;
};
const randomChar = (chars) => {
    const randomIndex = Math.floor(Math.random() * chars.length);
    return chars.charAt(randomIndex);
};
const base16Regex = /^[0-9a-fA-F]+$/;
const isBase16 = (str) => base16Regex.test(str);
const validatePrefix = (prefix) => {
    if (typeof prefix !== 'string')
        throw new Error('Prefix must be a string');
    if (prefix.length > 8)
        throw new Error('Prefix must be no more than 8 characters');
    if (!isBase16(prefix))
        throw new Error('Prefix must be only hexadecimal characters');
};
const addDashes = (str) => {
    return `${str.substring(0, 8)}-${str.substring(8, 12)}-${str.substring(12, 16)}-${str.substring(16, 20)}-${str.substring(20)}`;
};
const uuid = (prefix = '', timestamp = true, checksum = false, version = false, compatible = false) => {
    if (prefix) {
        validatePrefix(prefix);
        prefix = prefix.toLowerCase();
    }
    const center = typeof timestamp === 'number' ? timestamp.toString(16) : timestamp ? new Date().getTime().toString(16) : '';
    const suffix = randomBytes(32 - prefix.length - center.length - (checksum ? 2 : 0) - (compatible ? 2 : version ? 1 : 0));
    let joined = prefix + center + suffix;
    if (compatible) {
        joined = joined.substring(0, 12) + (timestamp ? '1' : '4') + joined.substring(12, 15) + randomChar('89ab') + joined.substring(15);
    }
    else if (version) {
        joined = joined.substring(0, 12) + '9' + joined.substring(12);
    }
    if (checksum) {
        joined += calcChecksum(joined);
    }
    return addDashes(joined);
};
const UUIDGenerator = (config) => {
    if (!config)
        throw new Error('The UUIDGenerator requires a config object');
    return (prefix = config.prefix || '', timestamp = config.timestamp === false ? false : config.timestamp || true, checksum = config.checksum || false, version = config.version || false, compatible = config.compatible || false) => uuid(prefix, timestamp, checksum, version, compatible);
};
exports.UUIDGenerator = UUIDGenerator;
exports.default = uuid;
