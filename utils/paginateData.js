


const paginateData = async function (modelName, filterKeys = [], page = 0, limit = 0, search = "", requiredFilterObj = {}, select = "") {
    let uploadPromise = new Promise(async (resolve, reject) => {
        try {
            const skip = (page - 1) * limit
            var query = {};
            if (search && search != "") {
                var filterArr = [];
                for (let k = 0; k < filterKeys.length; k++) {
                    let KeyName = filterKeys[k];
                    filterArr.push({ [KeyName]: { $regex: search, $options: 'i' } });
                }
                query = {
                    $or: filterArr
                }
            }
            const countDocuments = await modelName.countDocuments({ ...query, ...requiredFilterObj });
            var dataList;
            if (page > 0 && limit > 0) {
                dataList = await modelName.find({ ...query, ...requiredFilterObj }).select(select).skip(skip).limit(limit);
            }
            else {
                dataList = await modelName.find({ ...query, ...requiredFilterObj }).select(select);
            }


            const result = {
                totalRecord: countDocuments,
                data: dataList,
            }
            resolve(result);
        } catch (error) {
            console.error("error--->>", error);
            reject(error);
        }

    })
    return await uploadPromise;
};
module.exports = paginateData;
