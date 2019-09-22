module.exports = class binary {
    constructor(buffer, offset) {
        this.buffer = buffer;
        this.offset = offset || 0;
        this.length = buffer.length;
    }

    setOffset(offset) {
        this.offset = offset;
    }

    readInt() {
        this.offset += 4;
        return this.buffer.readUInt32LE(this.offset - 4);
    }

    readInt16() {
        this.offset += 2;
        return this.buffer.readUInt16LE(this.offset - 2);
    }

    writeInt(int) {
        this.buffer.writeUInt32LE(int, this.offset);
        this.offset += 4;
    }

    writeSInt(int) {
        this.buffer.writeInt32LE(int, this.offset);
        this.offset += 4;
    }

    writeInt16(int) {
        this.buffer.writeUInt16LE(int, this.offset);
        this.offset += 2;
    }

    writeInt8(int) {
        this.buffer.writeUInt8(int, this.offset);
        this.offset += 1;
    }

    readInt8() {
        this.offset += 1;
        return this.buffer.readUInt8(this.offset - 1);
    }

    readString(length) {
        length = length || this.readInt();
        var str = "";
        for (var l = 0; l !== length * 2; l += 2) {
            str += String.fromCharCode(this.readInt16());
        }
        return str;
    }

    writeString(str) {
        var length = str.length;
        this.writeInt(length);
        for (var l = 0; l !== length; l += 1) {
            this.writeInt16(str.charCodeAt(l));
        }
    }

    readBool() {
        return !!+this.readInt8();
    }

    writeBool(bool) {
        this.writeInt8(+bool);
    }

    cut() {
        this.buffer = this.buffer.slice(0, this.offset);
    }
};