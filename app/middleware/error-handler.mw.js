// eslint-disable-next-line no-unused-vars
let globalErrorHandler = (error, req, res, next) => {
    console.error('In global error handler');
    console.error(error);

    let err = res.error;
    if (!err) {
        switch (typeof error) {
            case 'string': err = { message : error }; break;
            case 'object': err = { message : error.message }; break;
        }
    }
    res.status(400).send({ error: err || `error with ${req.route.path}` });
};

let catchError = action => (req, res, next) => action(req, res, next).catch(next);

module.exports = {
    catchError,
    globalErrorHandler
};
