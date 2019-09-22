const fs = require("fs");
const binary = require("./binary.js");
const zstd = require('zstd-codec').ZstdCodec;
const streaming = new zstd.Streaming();
const simple = new zstd.Simple();
const rdata = fs.readFileSync("rdata");

var file = fs.readFileSync("./Data/Data.pk");
var key = file.readUInt32LE(10);
file = file.slice(14, file.length);
var data = new binary(Buffer.from(simple.decompress(unpack1(file, key))));

var stringList = [];
data.readBool(); //true
nextString(); //PackFroup
fs.mkdirSync("./Unpacked/");
folder("./Unpacked/");
function folder(dir) {
    data.readInt(); //1
    nextString(); //name
    var folderName = nextString();
    var totalFiles = data.readInt();
    dir = dir + folderName + "/";
    fs.mkdirSync(dir);
    var files = 0;

    while (files !== totalFiles) {
        data.readBool(); //true
        var str = nextString();
        if (str === "ChunkFroup") {
            data.readInt(); //5
            var a = nextString(); //name
            var dirName = nextString();
            nextString(); //fileName
            var fileName = nextString();
            nextString(); //key
            var key = Number.parseInt(nextString(), 10);
            nextString(); //dataHash
            var dataHash = nextString();
            nextString(); //mediaSize
            var mediaSize = nextString();
            data.readInt(); //0
            console.log("unpacking " + fileName + " with key " + key);
            if (dirName === "") {
                extractNcf("./Data/" + fileName, dir + "/", key);
            } else {
                fs.mkdirSync(dir + dirName);
                extractNcf("./Data/" + fileName, dir + dirName + "/", key);
            }
            files++;
        } else if (str === "PackFroup") {
            folder(dir);
            files++;
        }
    }
}

function extractNcf(inputPath, outputPath, dataKey) {
    var data = fs.readFileSync(inputPath);
    var header256 = unpack1(data.slice(128, 256), dataKey);
    var headerTwoLength = header256.readUInt32LE(8) << 5;
    var headerTwoKey = header256.readUInt32LE(12) ^ dataKey;
    var fileNames = {};
    var folderNames = {};
    var isCompressed = {};

    for (var off = 0; off !== headerTwoLength; off += 32) {
        var header32 = unpack1(data.slice(256 + off, 288 + off), headerTwoKey++);
        var fileType = header32.readUInt32LE(16);
        var fileStart = header32.readUInt32LE(4) << 8;
        var fileLength = header32.readUInt32LE(8);
        var file = data.slice(fileStart, fileStart + fileLength);
        if (fileType === 5) {
            var list = new binary(unpack2(file, dataKey));
            var folderId = header32.readUInt32LE(0);
            var folder = folderNames[folderId] || "";
            var num = list.readInt();
            if (num !== 0) {
                console.log("folders " + num);
                for (var foldersCount = 0; foldersCount !== num; foldersCount++) {
                    var folderName = "";
                    var x = list.readInt16();
                    while (x !== 0) {
                        folderName += String.fromCharCode(x);
                        x = list.readInt16();
                    }

                    var id1 = list.readInt();
                    folderNames[id1] = folderName + "/";
                    var fullPath = outputPath + folderName;
                    if (!fs.existsSync(fullPath)) {
                        fs.mkdirSync(fullPath);
                    }
                }
            }
            var filesAmount = list.readInt();
            console.log("files " + filesAmount);
            for (var filesCount = 0; filesCount !== filesAmount; filesCount++) {
                var name = "";
                var a = list.readInt16();
                while (a !== 0) {
                    name += String.fromCharCode(a);
                    a = list.readInt16();
                }

                var ext = "";
                for (i = 0; i !== 4; i++) {
                    var b = list.readInt8();
                    ext += b === 0 ? "" : String.fromCharCode(b);
                }

                var fileName = name + "." + reverseString(ext);
                var compress = list.readInt();
                var id = list.readInt();
                var origSize = list.readInt();
                fileNames[id] = folder + fileName;
                isCompressed[id] = compress;
            }
        } else {
            var fileId = header32.readUInt32LE(0);
            if (isCompressed[fileId] === 1) {
                var size = header32.readUInt32LE(12);
                file = streaming.decompress(file, size);
            }
            fs.writeFileSync(outputPath + fileNames[fileId], file);
        }
    }
}

function nextString() {
    var num = data.readInt();
    var str = stringList[0xFFFFFFFF - num];
    if (num === 0) {
        str = "";
    } else if (str === undefined) {
        str = data.readString(num);
        stringList.push(str);
    }
    return str;
}

function unpack2(data, a) {
    a = add(a, 530200914) ^ 2222193601;
    var key = Buffer.alloc(64);
    key.writeInt32LE(a, 0);
    for (i = 0; i !== 15; i++) {
        a = sub(a, 2072773695);
        key.writeUInt32LE(a, i * 4 + 4);
    }
    for (d = 0; d !== data.length; d++) {
        var toDecrypt = data.readInt8(d);
        var k = key.readInt8(d % 64);
        data.writeInt8(toDecrypt ^ k, d);
    }
    return data;
}

function unpack1(data, k) {
    var key = new Buffer.alloc(4);
    k >= -2147483648 && k <= 2147483647 ? key.writeInt32LE(k, 0) : key.writeUInt32LE(k, 0);
    var result = new binary(Buffer.alloc(data.length));
    data = new binary(data);
    var xor = 0;

    while (data.offset + 4 <= data.length) {
        var chunk = data.readInt();
        var newKey = 0;

        var i = 1;
        while (true) {
            var num = key[i];
            var a = rdata.readUInt32LE(num * 4 + i * 1024);
            newKey ^= a;

            if (i == 0) break;
            i == 3 ? i = 0 : i++;
        }
        key.writeUInt32LE(key.readUInt32LE(0) + 1, 0);
        var res = chunk ^ newKey ^ xor;
        xor = add(res, xor);
        result.writeSInt(res);
    }
    return result.buffer;
}

function add(sum, num) {
    sum += num;
    if (sum >= 4294967295) sum -= 4294967296;
    return sum;
}

function sub(sum, num) {
    var b = sum - num;
    if (b <= 0) b = sum + 4294967296 - num;
    return b;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}