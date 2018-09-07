import removeMatching from './removeMatching';

export default function removeScripts(node) {
    return removeMatching('script', node);
}