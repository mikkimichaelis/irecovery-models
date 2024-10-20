export const schema = {
    device: {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "device schema",
        "version": 0,
        "description": "describes a device",
        "primaryKey": "id",
        "type": "object",
        "properties": {
            "id": {
                "default": "",
                "type": "string",
                "minLength": 12,
                "maxLength": 12
            },
            "uniqueId": {           // getUniqueId()
                "default": null,
                "type": "string"
            },
            "brand": {              // getBrand()
                "default": null,
                "type": "string"
            },
            "buildNumber": {        // getBuildNumber()
                "default": null,
                "type": "string"
            },
            "carrier": {            // getCarrier()
                "default": null,
                "type": "string"
            },
            "deviceName": {         // getDeviceName()
                "default": null,
                "type": "string"
            },
            "deviceId": {           // getDeviceId()
                "default": null,
                "type": "string"
            },
            "isDevice": {           // useIsEmulator()
                "default": null,
                "type": "boolean"
            },
            "macAddress": {         // getMacAddress()
                "default": null,
                "type": "string"
            },
            "platformApiLevel": {   // getApiLevel()
                "default": null,
                "type": "number"
            },
            "totalMemory": {        // getTotalMemory()
                "default": null,
                "type": "number"
            },
            "updated": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "created": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            }
        },
    },
    schedule: {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "schedule schema",
        "version": 0,
        "description": "describes a schedule",
        "primaryKey": "id",
        "indexes": ["name", ["active", "authorized"]],
        "required": ["id", "name", "active", "authorized"],
        "properties": {
            "active": {
                "default": true,
                "type": "boolean"
            },
            "authorized": {
                "default": true,
                "type": "boolean"
            },
            "daily": {
                "default": false,
                "type": "boolean"
            },
            "id": {
                "default": "",
                "type": "string",
                "minLength": 12,
                "maxLength": 12
            },
            "name": {
                "default": "",
                "type": "string",
                "minLength": 1,
                "maxLength": 255
            },
            "meetings": {
                "type": "array",
                "ref": "meeting",
                "items": {
                    "type": "string"
                }
            },
            "updated": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            }
        },
        "type": "object"
    },
    meeting: {
        "title": "meeting schema",
        "version": 0,
        "description": "describes a meeting",
        "primaryKey": "id",
        "indexes": ["startDateTime", "endDateTime", ["active", "authorized", "verified"]],
        "required": ["id", "name", "startDateTime", "endDateTime", "active", "authorized", "verified"],
        "type": "object",
        "properties": {
            "passwordEnc": {
                "default": "",
                "type": "string"
            },
            "active": {
                "default": true,
                "type": "boolean"
            },
            "authorized": {
                "default": true,
                "type": "boolean"
            },
            "closed": {
                "default": false,
                "type": "boolean"
            },
            "continuous": {
                "default": false,
                "type": "boolean"
            },
            "dayOfWeek": {
                "default": "",
                "type": "string"
            },
            "description": {
                "default": "",
                "type": "string"
            },
            "duration": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "endDateTime": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "groupType": {
                "default": "",
                "type": "string"
            },
            "hash": {
                "default": "",
                "type": "string"
            },
            "id": {
                "default": "",
                "type": "string",
                "minLength": 12,
                "maxLength": 12
            },
            "language": {
                "default": "",
                "type": "string"
            },
            "location": {
                "default": "",
                "type": "string"
            },
            "meetingTypes": {
                "default": [],
                "items": {
                    "type": "string"
                },
                "type": "array"
            },
            "meetingUrl": {
                "default": "",
                "type": "string"
            },
            "name": {
                "default": "",
                "type": "string"
            },
            "password": {
                "default": "",
                "type": "string"
            },
            "requiresLogin": {
                "default": false,
                "type": "boolean"
            },
            "restricted": {
                "default": false,
                "type": "boolean"
            },
            "restrictedDescription": {
                "default": "",
                "type": "string"
            },
            "schedule": {
                "ref": "schedule",
                "type": "string",
                "default": null
            },
            "startDateTime": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "tags": {
                "default": [],
                "items": {
                    "type": "string"
                },
                "type": "array"
            },
            "time24h": {
                "default": "",
                "type": "string"
            },
            "timezone": {
                "default": "",
                "type": "string"
            },
            "updated": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "verified": {
                "default": true,
                "type": "boolean"
            },
            "verified_date": {
                "default": 0,
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "verified_status": {
                "type": "number",
                "multipleOf": 1,
                "minimum": 0,
                "maximum": 9007199254740991
            },
            "zid": {
                "default": "",
                "type": "string"
            }
        },
    }
}