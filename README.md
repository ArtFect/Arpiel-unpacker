# Arpiel unpacker

 Tool to unpack .ncf files of the game Ar:piel online (アルピエル, Arpiel)
 
## How to use?
1. Install [Node.js](http://nodejs.org "Node.js")
2. Download repository, extract files to folder
3. Put the Data folder with .ncf files in the tool folder
4. Open command line in folder and run `node unpack.js`

or

1. Download already unpacked files:  
[*Files from Japanese server on 22.09.2019*](https://www.mediafire.com/file/v41wwqjp717t9s8/ArpielUnpacked.zip/file "*Files from Japanese server on 22.09.2019*")

## How to convert Arpiel .gr2 models to other formats

Firstly you can view the models before converting them using gr2 viewer:  
https://forums.civfanatics.com/resources/granny-viewer-2-8-45-0.21206/

**A way to convert models with textures but no animations**
1. Convert .gr2 to .smd using grnreader98  
https://forums.civfanatics.com/resources/grnreader98.21177/
2. Convert .smd to any other format using Milkshape 3D  
 http://www.milkshape3d.com/

**A way to convert models with animations but no textures**
1. Convert .gr2 to .dae using lslib  
https://github.com/Norbyte/lslib

If you are familiar with 3D modeling tools, you can combine these two methods into a full-fledged model or find ways to do it all at once
