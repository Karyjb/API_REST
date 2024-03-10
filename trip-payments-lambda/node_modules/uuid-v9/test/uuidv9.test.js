const assert = require('assert')
const {
    default: uuid,
    verifyChecksum,
    validateUUID,
    UUIDGenerator
} = require('../dist')

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const uuidV1Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-1[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
const uuidV4Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
const uuidV9Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-9[0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

let sleepTimeout
const sleep = (ms) => {
    clearInterval(sleepTimeout)
    return new Promise(resolve => sleepTimeout = setTimeout(resolve, ms))
}

describe('uuid-v9', () => {
    it('should validate as a UUID', async () => {
        const id1 = uuid()
        const id2 = uuid('a1b2c3d4')
        const id3 = uuid('a1b2c3d4', false)
        const id4 = uuid('a1b2c3d4', true, true)
        const id5 = uuid('a1b2c3d4', true, true, true)
        const id6 = uuid('a1b2c3d4', true, true, true, true)
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidRegex.test(id3), true)
        assert.strictEqual(uuidRegex.test(id4), true)
        assert.strictEqual(uuidRegex.test(id5), true)
        assert.strictEqual(uuidRegex.test(id6), true)
    })
    it('should generate sequential UUIDs', async () => {
        const id1 = uuid()
        await sleep(2)
        const id2 = uuid()
        await sleep(2)
        const id3 = uuid()
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(!!id3, true)
        assert.strictEqual(id1 < id2, true)
        assert.strictEqual(id2 < id3, true)
    })
    it('should generate sequential UUIDs with a prefix', async () => {
        const id1 = uuid('a1b2c3d4')
        await sleep(2)
        const id2 = uuid('a1b2c3d4')
        await sleep(2)
        const id3 = uuid('a1b2c3d4')
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(!!id3, true)
        assert.strictEqual(id1 < id2, true)
        assert.strictEqual(id2 < id3, true)
        assert.strictEqual(id1.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id2.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id3.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id1.substring(14, 18), id2.substring(14, 18))
        assert.strictEqual(id2.substring(14, 18), id3.substring(14, 18))
    })
    it('should generate non-sequential UUIDs', async () => {
        const idS = uuid('', false)
        await sleep(2)
        const idNs = uuid('', false)
        assert.strictEqual(!!idS, true)
        assert.strictEqual(!!idNs, true)
        assert.strictEqual(idS.substring(0, 4) !== idNs.substring(0, 4), true)
    })
    it('should generate non-sequential UUIDs with a prefix', async () => {
        const idS = uuid('a1b2c3d4', false)
        await sleep(2)
        const idNs = uuid('a1b2c3d4', false)
        assert.strictEqual(!!idS, true)
        assert.strictEqual(!!idNs, true)
        assert.strictEqual(idS.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(idNs.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(idS.substring(14, 18) !== idNs.substring(14, 18), true)
    })
    it('should generate UUIDs with a checksum', async () => {
        const id1 = uuid('', true, true)
        const id2 = uuid('', false, true)
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(verifyChecksum(id1), true)
        assert.strictEqual(verifyChecksum(id2), true)
    })
    it('should generate UUIDs with a version', async () => {
        const id1 = uuid('', true, false, true)
        const id2 = uuid('', false, false, true)
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidV9Regex.test(id1), true)
        assert.strictEqual(uuidV9Regex.test(id2), true)
    })
    it('should generate backward compatible UUIDs', async () => {
        const id1 = uuid('', true, true, false, true)
        const id2 = uuid('a1b2c3d4', true, true, false, true)
        const id3 = uuid('', false, true, false, true)
        const id4 = uuid('a1b2c3d4', false, true, false, true)
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(!!id3, true)
        assert.strictEqual(!!id4, true)
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidRegex.test(id3), true)
        assert.strictEqual(uuidRegex.test(id4), true)
        assert.strictEqual(uuidV1Regex.test(id1), true)
        assert.strictEqual(uuidV1Regex.test(id2), true)
        assert.strictEqual(uuidV4Regex.test(id3), true)
        assert.strictEqual(uuidV4Regex.test(id4), true)
    })
    it('should correctly validate and verify checksum', async () => {
        const id1 = uuid('', true, true)
        const id2 = uuid('', false, true)
        const id3 = uuid('a1b2c3d4', true, true)
        const id4 = uuid('a1b2c3d4', false, true)
        const id5 = uuid('', true, true, false, true)
        const id6 = uuid('', false, true, true, true)
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(!!id3, true)
        assert.strictEqual(!!id4, true)
        assert.strictEqual(validateUUID(id1, true), true)
        assert.strictEqual(validateUUID(id2, true), true)
        assert.strictEqual(validateUUID(id3, true), true)
        assert.strictEqual(validateUUID(id4, true), true)
        assert.strictEqual(validateUUID(id5, true, '1'), true)
        assert.strictEqual(validateUUID(id6, true, '4'), true)
        assert.strictEqual(verifyChecksum(id1), true)
        assert.strictEqual(verifyChecksum(id2), true)
        assert.strictEqual(verifyChecksum(id3), true)
        assert.strictEqual(verifyChecksum(id4), true)
        assert.strictEqual(verifyChecksum(id5), true)
        assert.strictEqual(verifyChecksum(id6), true)
    })
    it('should provide a working generator utility', async () => {
        const uuid1 = UUIDGenerator({
            prefix: '',
            timestamp: true,
            checksum: true,
            version: false,
            compatible: false
        })
        const uuid2 = UUIDGenerator({
            prefix: 'a1b2c3d4',
            timestamp: false,
            checksum: false,
            version: false,
            compatible: true
        })
        const uuid3 = UUIDGenerator({
            prefix: '',
            timestamp: true,
            checksum: true,
            version: false,
            compatible: false
        })
        const uuid4 = UUIDGenerator({
            prefix: 'a1b2c3d4',
            timestamp: false,
            checksum: true,
            version: false,
            compatible: true
        })
        const id1 = uuid1('', false)
        const id2 = uuid2()
        const id3 = uuid3('a1b2c3d4', false, true, false, true)
        const id4 = uuid4('', true)
        await sleep(2)
        const id5 = uuid4('', true)
        assert.strictEqual(!!id1, true)
        assert.strictEqual(!!id2, true)
        assert.strictEqual(!!id3, true)
        assert.strictEqual(!!id4, true)
        assert.notStrictEqual(id1.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id2.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id3.substring(0, 8), 'a1b2c3d4')
        assert.notStrictEqual(id4.substring(0, 8), 'a1b2c3d4')
        assert.notStrictEqual(id5.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidRegex.test(id3), true)
        assert.strictEqual(uuidRegex.test(id4), true)
        assert.strictEqual(uuidV4Regex.test(id2), true)
        assert.strictEqual(uuidV4Regex.test(id3), true)
        assert.strictEqual(uuidV1Regex.test(id4), true)
        assert.strictEqual(uuidV1Regex.test(id5), true)
        assert.strictEqual(id4 < id5, true)
    })
})