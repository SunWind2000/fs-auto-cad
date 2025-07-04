const t = () => {
    console.log("This is a shared function from the shared package.");

    if (true) {
        console.log("This is a conditional block.");
    }

    return;
};

export { t };
