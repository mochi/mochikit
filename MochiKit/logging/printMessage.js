export default function printMessage(msg) {
    console.log(`LEVEL: ${msg.level}\nHAS_LOGGER: ${!!msg.logger}\nDATA:\n${msg.data}`); 
}