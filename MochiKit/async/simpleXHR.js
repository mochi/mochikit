export default function simpleXHR(
    url,
    method,
    { async = true, user, password },
    { done, error, progress, orsc }
) {
    let xhr = new XMLHttpRequest();
    xhr.open(url, method, async, user, password);

    if (done) {
        xhr.addEventListener('load', done);
    }

    if (error) {
        xhr.addEventListener('error', error);
    }

    if (progress) {
        xhr.addEventListener('progress', progress);
    }

    if (orsc) {
        xhr.addEventListener('readystatechange', orsc);
    }

    xhr.send();
    return xhr;
}
