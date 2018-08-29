export default function formatEval(string, ctx, ...args) {
    return (string + '').replace(/\{\{(.+)\}\}/g, (a, expr) => {
        try {
            return Function(expr).call(ctx, ...args);
        } catch(error) {
            return error;
        }
    });
}