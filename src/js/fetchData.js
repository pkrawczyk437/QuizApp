export const fetchData = async (url) => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch ({ message }) {
        const error = `<span>${message}</span>`;
        document.body.innerHTML = error;
    }
};