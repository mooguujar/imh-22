const BTNSTATUS = {
    EDIT: "继续编辑",
    SAVEANDSEND: "发送并保存",
    OPPSITESEND: "对方发送中，请稍后编辑",
};
const TITLETXT = {
    WEB: {
        top: "用户",
        bottom: "我的",
        topPlaceholder: "这里将展示用户的内容",
        bottomPlaceholder: "这里将展示你发送的内容",
    },
    USER: {
        top: "我的",
        bottom: "群管",
        topPlaceholder: "这里将展示你发送的内容",
        bottomPlaceholder: "这里将展示群管的内容",
    },
};

var CDN_URL = "https://oss.nongzhiw.cn";
var uploadedUrls = [];
var timer = null;
 var localUserInfo = localStorage.getItem('_userInfo') ? JSON.parse(localStorage.getItem('_userInfo')) : null;
        
// 获取当前页面的 URL 参数
const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get("userId");
let managerId = urlParams.get("managerId");
// 获取特定参数的值

if(localUserInfo){
    userId = localUserInfo.user_uid;
}

const isFromWeb = urlParams.get("from") == "web";

console.log({ userId }, { managerId }, { isFromWeb });

const topWrap = document.getElementById("top-wrap");
const bottomWrap = document.getElementById("bottom-wrap");

var imagePreview = document.getElementById("imagePreview");
var addImage = document.getElementById("addImage");
var imageInput = document.getElementById("imageInput");
var submitBtn = document.getElementById("submitBtn");
var textArea = document.getElementById("textarea");

const contentTitleTop = topWrap.querySelector("#content-title");
const contentTitleBottom = bottomWrap.querySelector("#content-title");

const textAreaTop = topWrap.querySelector("#textarea");
const textAreaBottom = bottomWrap.querySelector("#textarea");

const imagePreviewTop = topWrap.querySelector("#imagePreview");
const imagePreviewBottom = bottomWrap.querySelector("#imagePreview");
const refreshBtn = document.getElementById("refresh");

// 添加大图预览功能
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");

function showLoading(message = "上传中...") {
    // 创建 loading 遮罩
    const loadingOverlay = document.createElement("div");
    loadingOverlay.classList.add("loading-overlay");

    // 创建提示文本
    const loadingText = document.createElement("div");
    loadingText.classList.add("loading-text");
    loadingText.textContent = message;

    // 组装元素
    loadingOverlay.appendChild(loadingText);
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    // 移除 loading 遮罩
    const loadingOverlay = document.querySelector(".loading-overlay");
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

async function initFileCDN() {
    return new Promise((resolve, reject) => {
        RBChatRestHelper.getFileCDN(
            function (data) {
                resolve(data);
            },
            function (err) {
                console.log("=======initFileCDN===", { err });
                reject(err);
            }
        );
    });
}

// 请求接口初始化页面数据
function initDataFn() {
    return new Promise((resolve, reject) => {
        // 初始化默认 from manager to user
        RBChatRestHelper.getFeedBackDetail(
            managerId,
            userId,
            function (returnValue) {
                var res = JSON.parse(returnValue);
                console.log({ res });
                resolve(res);
            },
            function (err) {
                console.log("=======initDataFn===", { err });
                reject(err);
            }
        );
    });
}

// 获取图片后缀
function getFileExtension(url) {
    const matches = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/); // 正则提取扩展名
    return matches ? matches[1] : null;
}

// 
function imageTranscode(url) {
    let _url = url
    let _fileExt = getFileExtension(_url)
    // 不支持的图片格式，一律转为jpeg
    if (!['png', 'jpg', 'jpeg'].includes(_fileExt)) {
        _url += '?imageMogr2/format/jpeg'
    }
    return _url
}

function displayImage(
    url,
    imagePreviewNode = imagePreview,
    addImageNode = addImage,
    isShowDel = false
) {
    if (!url.includes("http")) {
        url = CDN_URL + "/message/" + url;
    }
    // 创建图片容器
    const wrapper = document.createElement("div");
    wrapper.classList.add("preview-image-wrapper");

    // 创建图片元素
    const img = document.createElement("img");
    img.src = imageTranscode(url);
    img.classList.add("preview-image");

    // 创建删除按钮
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "";
    // 根据 isShowDel 设置按钮的显示状态
    if (!isShowDel) {
        deleteBtn.style.display = "none";
    }
    deleteBtn.addEventListener("click", function () {
        // 删除图片和 URL
        wrapper.remove();
        const fileName = url.split("/").pop();
        const index = uploadedUrls.indexOf(fileName);
        if (index > -1) {
            uploadedUrls.splice(index, 1);
        }
    });

    // 组装元素
    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);
    imagePreviewNode.insertBefore(wrapper, addImageNode);
}

// 绑定上传图片相关事件
function initUploadEvents() {
    // 点击添加图片事件
    addImage.addEventListener("click", function () {
        imageInput.click();
    });

    // 选定图片事件
    imageInput.addEventListener("change", function (event) {
        const files = event.target.files;

        if (files.length === 0) return;
        // 显示 loading
        showLoading("上传中...");
        let completedCount = 0; // 记录已完成的上传数量

        for (let i = 0; i < files.length; i++) {
            RBChatUtils.uploadFile(
                files[i],
                function (data) {
                    // progress
                },
                function (errorMsg) {
                    // err
                    completedCount++;
                    if (completedCount === files.length) {
                        // 全部上传完成
                        hideLoading();
                    }
                },
                function (data) {
                    // suc
                    var objFromServer = data;
                    var url = CDN_URL + "/message/" + data.fileMd5;
                    displayImage(url, undefined, undefined, true);
                    uploadedUrls.push(data.fileMd5); // 保存上传成功的URL
                    completedCount++;
                    if (completedCount === files.length) {
                        // 全部上传完成
                        hideLoading();
                    }
                }
            );
        }
    });
}

function initPageData(initData) {
    // 因为初始默认 from manager to user，所以 src 为manager，bottom，dest为user，top
    var topTxt = initData.destTextContent;
    var topImgs = initData.destImgs ? initData.destImgs.split(",") : [];
    var bottomTxt = initData.srcTextContent;
    var bottomImgs = initData.srcImgs ? initData.srcImgs.split(",") : [];

    // console.log({ topImgs }, { bottomImgs });

    if (isFromWeb) {
        uploadedUrls = bottomImgs;
    } else {
        uploadedUrls = topImgs;
    }

    // 显示输入框文字
    textAreaTop.value = topTxt;
    textAreaBottom.value = bottomTxt;

    // 公共函数：显示图片 首次显示应该先清空再显示？
    function displayImages(imageUrls, wrapper) {
        const imagePreview = wrapper.querySelector("#imagePreview");
        const addImage = wrapper.querySelector("#addImage");
        // 当前是编辑状态，且要展示的是编辑者 是 web 就是 bottomWrap，否则就是topWrap
        var isDelBtnShow =
            submitBtn.textContent === BTNSTATUS.SAVEANDSEND &&
            ((isFromWeb && wrapper === bottomWrap) ||
                (!isFromWeb && wrapper === topWrap));
        imageUrls.forEach((url) =>
            displayImage(url, imagePreview, addImage, isDelBtnShow)
        );
    }

    // 显示图片
    // 清除 .image-preview 下的所有 .image-preview-wrapper 元素
    const wrappers = document.querySelectorAll(
        ".image-preview .preview-image-wrapper"
    );
    wrappers.forEach((wrapper) => wrapper.remove());

    displayImages(topImgs, topWrap);
    displayImages(bottomImgs, bottomWrap);
}

// 根据来源判断激活状态
function initActiveElements() {
    console.log('1112222222');

    if (isFromWeb) {
        imagePreview = bottomWrap.querySelector("#imagePreview");
        addImage = bottomWrap.querySelector("#addImage");
        imageInput = bottomWrap.querySelector("#imageInput");
        textArea = bottomWrap.querySelector("#textarea");
        contentTitleTop.textContent = TITLETXT.WEB.top;
        contentTitleBottom.textContent = TITLETXT.WEB.bottom;
        topWrap
            .querySelector("#textarea")
            .setAttribute("placeholder", TITLETXT.WEB.topPlaceholder);
        bottomWrap
            .querySelector("#textarea")
            .setAttribute("placeholder", TITLETXT.WEB.bottomPlaceholder);
    } else {
        imagePreview = topWrap.querySelector("#imagePreview");
        addImage = topWrap.querySelector("#addImage");
        imageInput = topWrap.querySelector("#imageInput");
        textArea = topWrap.querySelector("#textarea");
        contentTitleTop.textContent = TITLETXT.USER.top;
        contentTitleBottom.textContent = TITLETXT.USER.bottom;
        topWrap
            .querySelector("#textarea")
            .setAttribute("placeholder", TITLETXT.USER.topPlaceholder);
        bottomWrap
            .querySelector("#textarea")
            .setAttribute("placeholder", TITLETXT.USER.bottomPlaceholder);
    }
}

function handleImagePreview(e) {
    if (
        e.target.tagName === "IMG" &&
        e.target.classList.contains("preview-image")
    ) {
        modalImage.src = e.target.src; // 设置弹窗图片为点击的图片
        imageModal.style.display = "flex"; // 显示弹窗
    }
}

function initActiveStatus() {
    if (isFromWeb) {
        // 显示上传按钮
        // bottomWrap.querySelector("#addImage").style.display = "flex";
        // 显示删除按钮
        bottomWrap
            .querySelectorAll(".delete-btn")
            .forEach((item) => (item.style.display = "block"));
        // 激活输入框
        textAreaBottom.disabled = false;
        textAreaBottom.focus();
    } else {
        topWrap.querySelector("#addImage").style.display = "flex";
        topWrap
            .querySelectorAll(".delete-btn")
            .forEach((item) => (item.style.display = "block"));
        textAreaTop.disabled = false;
        textAreaTop.focus();
    }
}

function initTimer() {
    timer = setInterval(async () => {
        var btnStatus = submitBtn.textContent;
        if (submitBtn.textContent === BTNSTATUS.EDIT) {
            var initData = await initDataFn();
            initPageData(initData);
        }
    }, 10000);
}

// ================  开始
async function setup() {
    try {
        initActiveElements();
        CDN_URL = await initFileCDN();
        var initData = await initDataFn();
        //   console.log({ initData });
        // TODO: 将初始数据展示到页面上
        initPageData(initData);
        initUploadEvents();

        // 开启定时器
        // initTimer();

        // 给多个父元素添加事件监听
        [imagePreviewTop, imagePreviewBottom].forEach((element) => {
            element.addEventListener("click", handleImagePreview);
        });
        initActiveStatus();
    } catch (error) {
        console.log({ error });
        alert("出错了，请稍后重试");
    }
}

// 初始化页面数据
//   initData();

// 提交按钮逻辑
submitBtn.addEventListener("click", function () {
    // 根据状态
    var btnTxt = submitBtn.textContent;
    switch (btnTxt) {
        case BTNSTATUS.EDIT:
            if (isFromWeb) {
                // 显示上传按钮
                // bottomWrap.querySelector("#addImage").style.display = "flex";
                // 显示删除按钮
                bottomWrap
                    .querySelectorAll(".delete-btn")
                    .forEach((item) => (item.style.display = "block"));
                // 激活输入框
                textAreaBottom.disabled = false;
                textAreaBottom.focus();
            } else {
                topWrap.querySelector("#addImage").style.display = "flex";
                topWrap
                    .querySelectorAll(".delete-btn")
                    .forEach((item) => (item.style.display = "block"));
                textAreaTop.disabled = false;
                textAreaTop.focus();
            }
            refreshBtn.style.display = "none";
            submitBtn.classList.remove("status-edit");
            submitBtn.textContent = BTNSTATUS.SAVEANDSEND;
            break;
        case BTNSTATUS.SAVEANDSEND:
            // TODO: 提交事件
            var txt = textArea.value;
            console.log({ txt }, { uploadedUrls });
            const imgUrls = uploadedUrls.join(",");
            var fromUid = isFromWeb ? managerId : userId;
            var toUid = isFromWeb ? userId : managerId;
            RBChatRestHelper.saveFeedBackContent(
                fromUid,
                toUid,
                imgUrls,
                txt,
                function (data) {
                    // console.log(JSON.parse(data));
                    console.log({ data });

                    // 提交成功,修改按钮文字，禁用状态
                    if (data === "true") {
                        if (isFromWeb) {
                            // 显示上传按钮
                            bottomWrap.querySelector("#addImage").style.display =
                                "none";
                            // 显示删除按钮
                            bottomWrap
                                .querySelectorAll(".delete-btn")
                                .forEach((item) => (item.style.display = "none"));
                            // 激活输入框
                            textAreaBottom.disabled = true;
                        } else {
                            topWrap.querySelector("#addImage").style.display = "none";
                            topWrap
                                .querySelectorAll(".delete-btn")
                                .forEach((item) => (item.style.display = "none"));
                            textAreaTop.disabled = true;
                        }
                        refreshBtn.style.display = "block";
                        submitBtn.classList.add("status-edit");
                        submitBtn.textContent = BTNSTATUS.EDIT;
                    }
                },
                function (err) {
                    console.log({ err });
                }
            );
            break;
        case BTNSTATUS.OPPSITESEND:
            console.log("对方正在发送");
            break;
        default:
            break;
    }
});

bottomWrap.style.display = "none";

refreshBtn.addEventListener("click", async function () {
    var initData = await initDataFn();
    initPageData(initData);
});

// 点击图片查看大图
imagePreviewTop.addEventListener("click", (e) => {
    if (
        e.target.tagName === "IMG" &&
        e.target.classList.contains("preview-image")
    ) {
        modalImage.src = e.target.src; // 设置弹窗图片为点击的图片
        imageModal.style.display = "flex"; // 显示弹窗
    }
});

imagePreviewBottom.addEventListener("click", (e) => {
    if (
        e.target.tagName === "IMG" &&
        e.target.classList.contains("preview-image")
    ) {
        modalImage.src = e.target.src; // 设置弹窗图片为点击的图片
        imageModal.style.display = "flex"; // 显示弹窗
    }
});

// 点击关闭按钮或弹窗关闭大图
closeModal.addEventListener("click", () => {
    imageModal.style.display = "none";
});

imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
        imageModal.style.display = "none";
    }
});

setup();