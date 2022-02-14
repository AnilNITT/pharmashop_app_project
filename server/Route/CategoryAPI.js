const Category = require('../models/Categories')
const express = require('express')
const app = express()
const handleErr = require('../HandleFunction/HandleErr')
const handleSuccess = require('../HandleFunction/handleSuccess')
const jwt = require("jsonwebtoken");
const fs = require('fs')
const mime = require('mime')
const upload = require('../HandleFunction/UploadFile')
const mongoose = require('mongoose')
const ObjectId = mongoose.mongo.ObjectId
const webp = require('webp-converter');
webp.grant_permission();
//Add a Category 
app.post('/api/addCategory', upload.single('fileData'), (req, res) => {    //tested
    //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
    fs.readFile(req.file.path, (err, contents) => {
        if (err) {
            return res.json(handleErr(err))
        } else {
            if (req.body.name) {
                var file = __dirname + '/../pharmashopfiles/' + req.file.filename;
                var resultFile = __dirname + '/../pharmashopfiles/' + req.file.filename + '.webp';
                const result = webp.cwebp(file, resultFile, "-q 80", logging = "-v");
                result.then((resp) => {
                    console.log(resp);
                    let brand = {
                        name: req.body.name,
                        image: resultFile
                    }
                    Category.create(brand, (err, doc) => {
                        if (err) return res.json(handleErr(err))
                        else {
                            return res.json(handleSuccess(doc))
                        }
                    })
                });
            } else {
                return res.json(handleErr('Category can not be null'))
            }
        }
    });
})

//Change Brand image
app.post('/api/changeCategoryImage', upload.single('fileData'), (req, res) => {    //tested
    //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
    fs.readFile(req.file.path, (err, contents) => {
        if (err) {
            return res.json(handleErr(err))
        } else {
            if (req.body.id) {
                let { id } = req.body
                var file = __dirname + '/../pharmashopfiles/' + req.file.filename;
                var resultFile = __dirname + '/../pharmashopfiles/' + req.file.filename + '.webp';
                const result = webp.cwebp(file, resultFile, "-q 80", logging = "-v");
                result.then((resp) => {
                    Category.findByIdAndUpdate(id, { image: resultFile }, { new: true }).exec((err, doc) => {
                        if (err) return res.json(handleErr(err))
                        else {
                            return res.json(handleSuccess(doc))
                        }
                    })
                });
            } else {
                return res.json(handleErr('Brandcan not be null'))
            }
        }
    });
})

//Change brand name
app.put('/api/categoryName', (req, res) => {
    if (req.body.id && req.body.name) {
        let { id, name } = req.body
        Category.findByIdAndUpdate(id, { name }, { new: true }).exec((err, doc) => {
            if (err) return res.json(handleErr(err))
            else {
                return res.json(handleSuccess(doc))
            }
        })
    } else {
        return res.json(handleErr('Brand can not be null'))
    }
})

//Add Subcategory
app.post('/api/addSubcategory', upload.single('fileData'), (req, res) => {    //tested
    //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
    fs.readFile(req.file.path, (err, contents) => {
        if (err) {
            return res.json(handleErr(err))
        } else {
            if (req.body.name && req.body.category) {
                var file = __dirname + '/../pharmashopfiles/' + req.file.filename;
                var resultFile = __dirname + '/../pharmashopfiles/' + req.file.filename + '.webp';
                const result = webp.cwebp(file, resultFile, "-q 80", logging = "-v");
                result.then((resp) => {
                    let subcategory = {
                        name: req.body.name,
                        image: resultFile
                    }
                    Category.findByIdAndUpdate(req.body.category, {
                        $push: { subcategories: subcategory }
                    }, { new: true }).exec((err, doc) => {
                        if (err) return res.json(handleErr(err))
                        else {
                            return res.json(handleSuccess(doc))
                        }
                    })
                });
            } else {
                return res.json(handleErr('Subcategory can not be null'))
            }
        }
    });
})

//Update subcategory name
app.post('/api/updateSubcategoryName', (req, res) => {
    if (req.body.id && req.body.subcategory && req.body.name) {
        let { id, subcategory, name } = req.body
        Category.updateOne({ _id: new ObjectId(id), "subcategories._id": new ObjectId(subcategory) }, {
            $set: { "subcategories.$.name": name }
        }).exec((err, doc) => {
            if (err) return res.json(handleErr(err))
            else {
                return res.json(handleSuccess(doc))
            }
        })
    } else {
        return res.json(handleErr('Category and Subcategory can not be null'))
    }
})

//Change Subcategory image
app.post('/api/changeSubcategoryImage', upload.single('fileData'), (req, res) => {    //tested
    //below code will read the data from the upload folder. Multer will automatically upload the file in that folder with an  autogenerated name
    fs.readFile(req.file.path, (err, contents) => {
        if (err) {
            return res.json(handleErr(err))
        } else {
            if (req.body.id && req.body.subcategory) {
                let { id, subcategory } = req.body
                var file = __dirname + '/../pharmashopfiles/' + req.file.filename;
                var resultFile = __dirname + '/../pharmashopfiles/' + req.file.filename + '.webp';
                const result = webp.cwebp(file, resultFile, "-q 80", logging = "-v");
                result.then((resp) => {
                    Category.updateOne({ _id: new ObjectId(id), "subcategories._id": new ObjectId(subcategory) }, {
                        $set: { "subcategories.$.image": resultFile }
                    }).exec((err, doc) => {
                        if (err) return res.json(handleErr(err))
                        else {
                            Category.findById(id, (err, doc) => {
                                if (err) return res.json(handleErr(err))
                                else {
                                    return res.json(handleSuccess(doc))
                                }
                            })
                        }
                    })
                });

            } else {
                return res.json(handleErr('Category and Subcategory can not be null'))
            }
        }
    });
})

app.post('/api/getAllCategories', (req, res) => {
    Category.find({}).sort({ createdDate: -1 }).exec((err, docs) => {
        if (err) return res.json(handleErr(err))
        else {
            return res.json(handleSuccess(docs))
        }
    })
})

//Bulk update categories
app.get('/api/bulkUpdateCategories', (req, res) => {
    Category.updateMany({}, { enabled: true }, (err, docs) => {
        if (err) return res.json(handleErr(err))
        else {
            return res.json(handleSuccess(docs))
        }
    })
})

app.get('/api/bulUpdateSubCat', (req, res) => {
    Category.find({}, (err, docs) => {
        if (err) return res.json(handleErr(err))
        else {
            docs.forEach((doc, index) => {
                if (index === 0)
                    console.log('docccc-->', doc)
                if (doc.subcategories.length > 0) {
                    let { subcategories } = doc
                    subcategories.forEach((sub) => {
                        Category.updateOne({ _id: new ObjectId(doc._id), "subcategories._id": new ObjectId(sub._id) }, {
                            $set: { "subcategories.$.enabled": true }
                        }).exec((err, doc) => {
                            if (err) return res.json(handleErr(err))
                            else {
                                // return res.json(handleSuccess(doc))
                            }
                        })
                    })
                }
            })
        }
    })
    setTimeout(() => {
        return res.json(handleSuccess('done'))
    }, 10000)
})


//Enable/Disable Category
app.put('/api/updateCategoryStatus', (req, res) => {
    if (req.body.id && req.body.status !== undefined) {
        let { id, status } = req.body
        Category.findByIdAndUpdate(id, { enabled: status }, { new: true }, (err, doc) => {
            if (err) return res.json(handleErr(err))
            else {
                return res.json(handleSuccess(doc))
            }
        })
    } else {
        return res.json(handleErr('Category data is required'))
    }
})

//Enable/Disable Subcategory
app.put('/api/updateSubCatStatus', (req, res) => {
    if (req.body.category && req.body.subcategory && req.body.status !== undefined) {
        let { category, subcategory, status } = req.body
        Category.updateOne({ _id: new ObjectId(category), "subcategories._id": new ObjectId(subcategory) }, {
            $set: { "subcategories.$.enabled": status }
        }).exec((err, doc) => {
            if (err) return res.json(handleErr(err))
            else {
                Category.findById(category, (errr, cat) => {
                    if (errr) return res.json(handleErr(errr))
                    else {
                        return res.json(handleSuccess(cat))
                    }
                })
            }
        })
    }
    else {
        return res.json(handleErr('Category data is required'))
    }

})

//Search Category
app.post('/api/searchCategory', (req, res) => {
    if (req.body.name) {
        Category.find({ name: { $regex: req.body.name + '.*' } })
            .limit(20)
            .exec((err, docs) => {
                if (err)
                    return res.json(handleErr(err))
                else { res.json(handleSuccess(docs)) }
            });
    } else {
        return res.json(handleErr('User name is required'))
    }
})

//Delete category by id
app.post('/api/deleteCategory', (req, res) => {
    if (req.body.id) {
        let { id } = req.body
        Category.findByIdAndDelete(id, (err, doc) => {
            if (err) return res.json(handleErr(err))
            else {
                return res.json(handleSuccess(doc))
            }
        })
    } else {
        return res.json(handleErr('Category can not be null'))
    }
})

//categories with products
app.get('/api/getallcategorieswithproducts', (req, res) => {
    Category.aggregate
        ([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "anything"
                }
            },
            { $project: { enabled: 1, createdDate: 1, name: 1, image: 1, subcategories: 1, size: { $size: "$anything" } } },
            { $match: { size: { $gt: 0 } } },
            { $project: { enabled: 1, createdDate: 1, name: 1, image: 1, subcategories: 1 } },
        ]).exec((err, docs) => {
            if (err) {
                return res.json({ message: "Failed", err })
            }
            else {
                return res.json({ message: "Categories with products", docs })
            }
        })
})


//Get 10 categories
app.get('/api/get10Categories', (req, res) => {
    Category.aggregate
        ([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "anything"
                }
            },
            { $project: { enabled: 1, createdDate: 1, name: 1, image: 1, subcategories: 1, size: { $size: "$anything" } } },
            { $match: { size: { $gt: 0 } } },
            { $project: { enabled: 1, createdDate: 1, name: 1, image: 1, subcategories: 1 } },
        ]).limit(10).exec((err, docs) => {
            if (err) {
                return res.json({ message: "Failed", err })
            }
            else {
                return res.json(handleSuccess(docs))
            }
        })
})

//Bulk categories
app.post('/api/bulkCategories', (req, res) => {
    let files = [
        "files-1627908307859",
        "files-1627908307860",
        "files-1627908307860",
        "files-1627908307861",
        "files-1627908307862",
        "files-1627908307863",
        "files-1627908307864",
        "files-1627908307865"
    ]
    files.forEach((fileName) => {
        let randomNumber = Math.round(Math.random() * 800)
        let data = {
            name: "Category " + randomNumber,
            image: fileName
        }
        Category.create(data, (err, doc) => {
            if (err) return res.json(handleErr(err))
            else {
                let reversed = ["files-1627908307865", "files-1627908307864", "files-1627908307863", "files-1627908307862", "files-1627908307861", "files-1627908307860", "files-1627908307860", "files-1627908307859"]
                reversed.forEach((rever) => {
                    let randomNum = Math.round(Math.random() * 8000)
                    let sub = {
                        name: "Subcat " + randomNum,
                        image: rever
                    }
                    Category.findByIdAndUpdate(doc._id, { $push: { subcategories: sub } }, { new: true }, (errr, subcat) => {
                        if (errr) return res.json(handleErr(errr))
                        else {
                            console.log('sdifhso')
                        }
                    })
                })
            }
        })
    })
    setTimeout(() => {
        return res.json(handleSuccess('DONE'))
    }, 10000)
})
module.exports = app