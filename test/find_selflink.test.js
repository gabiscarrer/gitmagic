const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

class Element {
    constructor(tagName, href) {
        this.tagName = tagName;
        this.href = href;
        this.className = "";
        this.childNodes = [];
        this.parentNode = null;
    }

    get firstChild() {
        return this.childNodes[0] || null;
    }

    appendChild(child) {
        if (child.parentNode) {
            const oldIndex = child.parentNode.childNodes.indexOf(child);
            child.parentNode.childNodes.splice(oldIndex, 1);
        }
        this.childNodes.push(child);
        child.parentNode = this;
    }

    replaceChild(replacement, child) {
        const index = this.childNodes.indexOf(child);
        this.childNodes[index] = replacement;
        replacement.parentNode = this;
        child.parentNode = null;
    }
}

test("replaces every adjacent self-link without dropping its children", () => {
    const url = "https://example.test/chapter.html";
    const root = new Element("nav");
    const first = new Element("a", url);
    const second = new Element("a", url);
    const external = new Element("a", "https://example.test/other.html");
    const text = { value: "Chapter", parentNode: null };
    const emphasis = new Element("em");

    first.appendChild(text);
    first.appendChild(emphasis);
    root.appendChild(first);
    root.appendChild(second);
    root.appendChild(external);

    const links = new Proxy({}, {
        get(target, property) {
            const currentLinks = root.childNodes.filter(
                (child) => child.tagName === "a",
            );
            return property === "length" ? currentLinks.length : currentLinks[property];
        },
    });
    const document = {
        URL: url,
        createElement: (tagName) => new Element(tagName),
        links,
    };

    const source = fs.readFileSync("find_selflink.js", "utf8");
    vm.runInNewContext(source, { document });

    assert.deepEqual(root.childNodes.map((child) => child.tagName), [
        "span",
        "span",
        "a",
    ]);
    assert.equal(root.childNodes[0].className, "currentlink");
    assert.deepEqual(root.childNodes[0].childNodes, [text, emphasis]);
    assert.equal(root.childNodes[2], external);
});
