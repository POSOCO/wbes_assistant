var MarginUtil = require('../utils/wbesDCSchUtils');

// MarginUtil.getNewIsgsMarginsObj('ALL','29-11-2018',10,function(err, res){
//     if (err) {
//         return console.log(err);
//     }
//     console.log(res);
// });

MarginUtil.getIsgsDcOnbarSchObj('29-11-2018',10,'ALL',function(err, res){
    if (err) {
        return console.log(err);
    }
    console.log(res);
});