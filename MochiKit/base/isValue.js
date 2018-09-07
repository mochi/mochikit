export default function isValue(obj) {
    //Why check null for typeof?
    let type = obj == null ? null : typeof obj;
    return type === 'boolean' || type === 'number' || type === 'string';
}