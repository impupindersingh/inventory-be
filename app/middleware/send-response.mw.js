module.exports = {
    sendResponse
};

function sendResponse(req, res) {
    if (res.redirect_uri) {
        res.redirect(res.redirect_uri);
    } else if (res.auth_failed) {
        res.status(401).json({ error: res.auth_failed });
    } else if (res.error) {
        res.status(400).json({ error: res.error });
    } else {
        res.status(200).json({ data: res.data });
    }
}
