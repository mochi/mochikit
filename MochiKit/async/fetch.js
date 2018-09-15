//For now:
export default typeof window === 'object' ? fetch : (url, options) => {
    throw new Error('get* functions not supported in node environments yet.');
}