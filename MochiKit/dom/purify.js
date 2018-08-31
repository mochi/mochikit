import removeMatching from "./removeMatching";

export default function purify(tree) {
    removeMatching('script', tree);
    removeMatching('style', tree);
    removeMatching('link', tree);
    //TODO: remove [style]
    return tree;
}