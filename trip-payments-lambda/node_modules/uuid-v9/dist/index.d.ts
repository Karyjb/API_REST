export declare const verifyChecksum: (uuid: string) => boolean;
export declare const validateUUID: (uuid: string, checksum?: boolean, version?: boolean | number) => boolean;
declare const uuid: (prefix?: string, timestamp?: boolean | number, checksum?: boolean, version?: boolean, compatible?: boolean) => string;
export interface UUIDGeneratorConfig {
    prefix?: string;
    timestamp?: boolean | number;
    checksum?: boolean;
    version?: boolean;
    compatible?: boolean;
}
export declare const UUIDGenerator: (config: UUIDGeneratorConfig) => (prefix?: string, timestamp?: boolean | number, checksum?: boolean, version?: boolean, compatible?: boolean) => string;
export default uuid;
