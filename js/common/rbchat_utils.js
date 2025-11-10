
'use strict';

/**
 * 实用工具类。
 *
 * 使用面向对向的方式调用实现方法，是为了规范代码的引用和调用，否则浏览器端引用的JS一多，
 * 各种交叉调用会让代码看起来异常混乱。
 *
 * @author Jack Jiang(http://www.52im.net/space-uid-1.html)
 * @version 1.0
 * @since 1.0
 */

// RBChatUtils
(function () {

    /** 用于存储登陆认证成功后服务端返回的本地用户完整信息到本地cookie，以便在意外关闭网页等情况下能恢复此用户数据 */
    var COOKIE_KEY_AUTHED_LOCAL_USER_INFO_ID = 'aluiid';
    /** 存储登陆认证成功后服务端返回的本地用户完整信息的cookie过期时间 */
    var COOKIE_KEY_AUTHED_LOCAL_USER_INFO_$EXPIRETIME = 2 * 24 * 60 * 60 * 1000;// 单位：毫秒，目前是保存2*24小时
    /** 用于存储“声音提醒开关”的配置信息到本地cookie，以便在意外关闭网页等情况下能恢复此用户数据 */
    var COOKIE_KEY_MSG_TONE_ID = 'mtid';
    /** 存储“声音提醒开关”的配置信息的cookie过期时间 */
    var COOKIE_KEY_MSG_TONE_$EXPIRETIME = 999 * 24 * 60 * 60 * 1000;// 单位：毫秒，目前是保存999*24小时
    /** 城市映射表 */
    var provinceMap = {
        "beijing": "北京",       // 直辖市
        "tianjin": "天津",       // 直辖市
        "shanghai": "上海",     // 直辖市
        "chongqing": "重庆",    // 直辖市
        "hebei": "河北",        // 省
        "henan": "河南",        // 省
        "hunan": "湖南",        // 省
        "jiangsu": "江苏",      // 省
        "zhejiang": "浙江",     // 省
        "anhui": "安徽",        // 省
        "fujian": "福建",       // 省
        "jiangxi": "江西",      // 省
        "shandong": "山东",     // 省
        "shanxi": "山西",       // 省
        "liaoning": "辽宁",     // 省
        "heilongjiang": "黑龙江", // 省
        "guangdong": "广东",    // 省
        "guangxi": "广西",      // 自治区
        "hainan": "海南",       // 省
        "sichuan": "四川",      // 省
        "guizhou": "贵州",      // 省
        "yunnan": "云南",       // 省
        "xizang": "西藏",       // 自治区
        "ningxia": "宁夏",      // 自治区
        "xinjiang": "新疆",     // 自治区
        "taiwan": "台湾",       // 台湾
        "macau": "澳门",        // 澳门
        "hongkong": "香港"      // 香港
      };

      const KEY = "cdemhsa16bbcjpy1";
      const iv = "l81kvhvavn2990c5";

    /**
     * 设置文本组件获得焦点（并让光标显示在最后一个字符末尾）。
     *
     * 说明：因为使用jquery对象的.focus()方法在Mac的Safari这
     * 样的浏览器上，可以获得焦点但不能将光标移到末尾，所以干脆用本函数实现的这种通用方法，就不会出现浏览器兼容问题了。
     *
     * @param {jQueryObj} jqueryTextObj
     * @private
     */
    function _setTextFocus(jqueryTextObj) {
        if (jqueryTextObj) {
            var t = jqueryTextObj.val();
            jqueryTextObj.val("").focus().val(t);
        }
    }

    /**
     * 获得下载指定用户头像的完整http地址.
     * <p>
     * 形如：“http://192.168.88.138:8080/UserAvatarDownloadController?action=ad&user_uid=400007&enforceDawnload=1”。
     *
     * @param {string} userUid 要下载头像的用户uid
     * @param {boolean} dontUseCache true表示将在URL尾巴上加一个时间戳，从而实现浏览器显示时不缓存的作用
     * @return {String} 完整的http文件下载地址
     */
    function _getUserAvatarDownloadURL2(userUid) {
        return RBChatConfig.FILE_HTTPS_URL + "/head/" + userUid + '_pic.jpg?t=' + new Date().getTime()
    }

    function _getUserAvatarDownloadURL(userUid, dontUseCache) {
        return RBChatConfig.FILE_HTTPS_URL + "/head/" + userUid + '_pic.jpg?t=' + new Date().getTime() + '&imageView2/1/w/256/h/256'
    }


    /**
     * 获得下载指定群组头像的完整http地址.
     * <p>
     * 形如：“http://192.168.88.138:8080/BinaryDownloader?
     * action=gavartar_d&user_uid=400007&file_name=0000000152.jpg”。
     *
     * @param {String} gid 要下载群头像的群id
     * @param {boolean} dontUseCache true表示将在URL尾巴上加一个时间戳，从而实现浏览器显示时不缓存的作用
     * @return {String} 完整的http文件下载地址
     */
    function _getGroupAvatarDownloadURL(gid, dontUseCache) {
        return RBChatConfig.FILE_HTTPS_URL + "/head/" + gid + '_pic.jpg?t=' + new Date().getTime() + '&imageView2/1/w/256/h/256'
    }

    /**
     *  判断是否@了自己
     * @param {*} list 
     * @returns 
     */
    function _isTipMy(list) {
        var isTip = false;
        var localUserUid = LocalUserInfo.getUid();
        for (const item of list) {
            // 全体人员
            if ('333333' == item.user_uid) {
                isTip = true;
                break;
            }
            // 用户id
            if (localUserUid == item.user_uid) {
                isTip = true;
                break;
            }
        }
        return isTip;
    }

    function _getBgColor(id) {
        const colors = ['#EB914F', '#5393ED', '#D76AEE', '#EE6A73', '#50EBA8', '#9C6AEE']
        return colors[(id - 0) % colors.length]
    }

    // 群头像
    function _getGroupAvatarDownloadURL2(group_avatar_file_name) {
        return RBChatConfig.FILE_HTTPS_URL + "/head/" + group_avatar_file_name
    }

    // 获取图片后缀
    function getFileExtension(url) {
        const matches = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/); // 正则提取扩展名
        return matches ? matches[1] : null;
      }

    /**
     * 获得下载指定图片消息的图片2进制数据的完整http地址.
     * <p>
     * 形如：“http://192.168.88.138:8080/BinaryDownloader?
     * action=image_d&user_uid=400007&file_name=91c3e0d81b2039caa9c9899668b249e8.jpg”。
     *
     * @param {String} file_name 要下载的图片文件名
     * @param {boolean} needDump 是否需要转储：true表示需要转储，否则不需要. 转储是用于图片消息接收方在打开了该图片消息完整图后
     * 通知服务端将此图进行转储（转储的可能性有2种：直接删除掉、移到其它存储位置），转储的目的是防止大量用户的大量图片
     * 被读过后还存储在服务器上，加大了服务器的存储压力。<b>注意：</b><u>读取缩略图时无需转储！</u>
     * @return {String} 完整的http文件下载地址
     */
    function _getImageDownloadURL(file_name, needDump) {
        let _url = RBChatConfig.FILE_HTTPS_URL + '/message/' + file_name
        let _fileExt = getFileExtension(_url)
        // 不支持的图片格式，一律转为jpeg
        if (!['png', 'jpg', 'jpeg'].includes(_fileExt) && _fileExt != 'mp4') {
            _url += '?imageMogr2/format/jpeg'
        }
        return _url
    }

    function arraybufferToBase64(arrayBuffer) {
        return new Promise(function (resolve) {
            const blob = new Blob([arrayBuffer]);
            const reader = new FileReader();
            reader.onload = function (event) {
                const base64String = event.target.result.split(",")[1]; // 获取Base64部分
                resolve(base64String);
            };
            reader.readAsDataURL(blob);
        });
    }

    function uint8ArrayToBase64(uint8Array) {
        let binaryString = '';
        const chunkSize = 8192; // 分块大小

        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binaryString); // 将二进制字符串转为Base64
    }

    function DecryptImage(base64String) {
        const media_key = CryptoJS.enc.Utf8.parse(KEY);
        const media_iv = CryptoJS.enc.Utf8.parse(iv);
        const encryptedWordArray = CryptoJS.enc.Base64.parse(base64String);
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encryptedWordArray },
            media_key,
            {
                iv: media_iv,
                mode: CryptoJS.mode.CFB,
                padding: CryptoJS.pad.NoPadding,
            }
        );
        return decrypted.toString(CryptoJS.enc.Latin1); // 返回解密后的数据
    }

    async function decImage(url) {
        let _url = url
        if (!url) return
        if (_url.indexOf('http') == -1) {
            _url = RBChatConfig.FILE_HTTPS_URL + '/' + _url
        }
        console.log(_url, 2121123121121)
        const response = await fetch(_url);
        if (!response.ok) {
            throw new Error("网络响应错误");
        }
        console.log(response, _url, 2121123121121)
        const arrayBuffer = await response.arrayBuffer();
        const base64 = await arraybufferToBase64(arrayBuffer); // 将 ArrayBuffer 转换为 Base64
        const decryptedData = DecryptImage(base64);  // 解密 Base64 数据
        const byteArray = new Uint8Array(decryptedData.length);
        for (let i = 0; i < decryptedData.length; i++) {
            byteArray[i] = decryptedData.charCodeAt(i);
        }
        const ext = _url.substring(_url.lastIndexOf('.') + 1); // 获取文件扩展名
        const base64String = uint8ArrayToBase64(byteArray); // 使用分块处理转换Uint8Array为Base64字符串
        const mediaUrl = `data:${ext === 'mp4' || ext === 'webm' || ext === 'ogg' ? 'video' : 'image'}/${ext};base64,${base64String}`;
        return mediaUrl;
    }

    /**
     * 获得下载指定语音留言消息的声音2进制数据的完整http地址.
     * <p>
     * 形如：“http://192.168.88.138:8080/BinaryDownloader?
     * action=voice_mp3_d&user_uid=400007&file_name=1200_91c3e0d81b2039caa9c9899668b249e8.amr”。
     *
     * @param {String} file_name 要下载的语音留言文件名
     * @param {boolean} needDump 是否需要转储：true表示需要转储，否则不需要. 转储是用于语音留言消息接收方在打开了该语音留言消息后
     * 通知服务端将语音留言进行转储（转储的可能性有2种：直接删除掉、移到其它存储位置），转储的目的是防止大量用户的大量语音留言
     * 被读过后还存储在服务器上，加大了服务器的存储压力。
     * @return {String} 完整的http文件下载地址
     */
    function _getVoiceDownloadURL(file_name, needDump) {
        file_name = file_name.split('.')[0] + '.mp3'
        return RBChatConfig.FILE_HTTPS_URL + '/message/' + file_name
    }

    //图片压缩
    function  image_compress(file,callBak){
        //获取文件的大小
        function getImageFileSize(file,callBack) {
            const reader = new FileReader();
            reader.onload = () => {
                    const dataURL = reader.result;
                    const fileSize = Math.floor(dataURL.length * 0.8); // 获取文件大小，单位为字节
                    callBack(fileSize);
            };
            reader.readAsDataURL(file);   
        }
        //压缩图片
        function  compress(file,callBack){
                var dataURLtoBlob = function (dataurl) {
                        var arr = dataurl.split(','),
                            mime = arr[0].match(/:(.*?);/)[1],
                            bstr = atob(arr[1]),
                            n = bstr.length,
                            u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        return new Blob([u8arr], { type: mime });
                }
                var blobToFile = function (theBlob, fileName) {
                    theBlob.lastModifiedDate = new Date();  // 文件最后的修改日期
                    theBlob.name = fileName;                // 文件名
                    return new File([theBlob], fileName, { type: theBlob.type, lastModified: Date.now() });
                }
                var reader = new FileReader();
                reader.onload = function(e) {
                    var img = new Image();
                    img.src = e.target.result;
                    img.onload = function() {
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        var width = img.width > 960 ? 960:img.width;
                        var height = img.height * width/img.width;
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        var dataURL = canvas.toDataURL('image/jpeg', 0.7);
                        callBack(blobToFile(dataURLtoBlob(dataURL), 'temp_1.jpg'))
                    }
                };
                reader.readAsDataURL(file);
        }

        let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
        fileExt = fileExt.toLowerCase();
        if(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpeg'){
            getImageFileSize(file,function(fileSize){
                // 文件超过100KB进行压缩
                if(fileSize > 1024*100){
                    compress(file,function(cfile){
                        callBak(cfile);
                    });
                }else{
                    callBak(file);
                }
            });
        }else{
            callBak(file);
        }
    }

    /**
     *  上传文件服务器
     * @param {*} file  文件
     * @param {*} onProgress  上传进度
     * @param {*} errorFun  错误返回
     * @param {*} successFunc  成功返回
     */
    function _uploadFile(cfile, onProgress, errorFun, successFunc) {

        //获取视频时长
        var getVideoTime = function (file) {
            if (file.type.includes('video')) {
                return new Promise((resolve, reject) => {
                    let url = URL.createObjectURL(file);
                    let audioElement = new Audio(url);
                    audioElement.addEventListener("loadedmetadata", (_event) => {
                        let duration = parseInt(audioElement.duration);
                        resolve(duration)
                    });
                })
            } else {
                return new Promise((resolve, reject) => {
                    resolve(0)
                })
            }

        }

        //图片压缩
        image_compress(cfile,function(file){
            getVideoTime(file).then(duration => {
                var coss_d = function(data){
                    // console.log("==================", {data});             
                    const credentials = data.credentials;
                    var cos = new COS({
                        // getAuthorization 必选参数
                        getAuthorization: function (options, callback) {
                            callback({
                                TmpSecretId: credentials.tmpSecretId,
                                TmpSecretKey: credentials.tmpSecretKey,
                                SecurityToken: credentials.sessionToken,
                                StartTime: data.startTime,
                                ExpiredTime: data.expiredTime,
                            });
                        }
                    });
                    //获取文件的扩展名
                    let fileExt = file.name.substr(file.name.lastIndexOf(".") + 1);
                    let fileMd5Name = (file.type.includes('video') ? (duration * 1000) + '_' : '') + new Date().getTime() + '.' + fileExt;
                    cos.uploadFile({
                        Bucket: data.bucket,// 'im-1306281965', /* 填写自己的bucket，必须字段 */
                        Region: data.region,// 'accelerate',     /* 存储桶所在地域，必须字段 */
                        Key: 'message/' + fileMd5Name,              /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */
                        StorageClass: 'STANDARD',
                        Body: file, // 上传文件对象
                        SliceSize: 1024 * 1024 * 5,     /* 触发分块上传的阈值，超过5MB使用分块上传，小于5MB使用简单上传。可自行设置，非必须 */
                        onProgress: function (progressData) {
                            if (onProgress) {
                                onProgress(progressData)
                            }
                        }
                    }, function (err, data) {
                        if (err) {
                            if (errorFun) {
                                errorFun()
                            }
                        } else {
        
                            if (successFunc) {
                                successFunc({ fileName: file.name, fileLength: file.size, fileMd5: fileMd5Name })
                            }
                        }
                    });
                }

                const lastOssCache = sessionStorage.getItem('oos_temp_key')
                if (lastOssCache) {
                    try {
                        const obj = JSON.parse(lastOssCache)
                        if (Date.now() < obj.expiredTime * 1000) {
                            coss_d(obj)
                            return
                        }
                    } catch (err) {}
                }
                
                RBChatRestHelper.oos_temp_key(function(res){
                    coss_d(JSON.parse(res))
                    sessionStorage.setItem('oos_temp_key', res)
                },function(){})
    
                
            }).catch(err => {
                if (errorFun) {
                    errorFun()
                }
            });
        });

      
    }

    /**
    * 获得大文件下载服务的完整http地址.
    * <p>
    * 形如：“http://192.168.1.195:8080/rainbowchat/BigFileDownloader?user_uid=400007
        * &file_md5=1aa7e1cc0405e3d5a52ae25d9eb6fbbb&skip_length=100”。
    *
    * @param {String}fileMd5 要下载的文件md5码
    * @param {String} file_name 要保存时的文件名
    * @return {String} 完整的http文件下载地址
    */
    function _getBigFileDownloadURL(fileMd5, file_name) {
        return RBChatConfig.FILE_HTTPS_URL + '/message/' + fileMd5
    }

    /**
     * 获得短视频消息的视频文件下载服务的完整http地址.
     * <p>
     * 形如：“http://192.168.1.195:8080/rainbowchat/ShortVideoDownloader?user_uid=400007
     * &file_name=8990_dsjdsdsdjskdskdkj2232.mp4&file_md5=1aa7e1cc0405e3d5a52ae25d9eb6fbbb”。
     *
     * @param {String} file_name 要下载的视频文件名
     * @param {String} fileMd5 要下载的文件md5码
     * @return {String} 完整的http文件下载地址
     */
    function _getShortVideoDownloadURL(file_name, fileMd5) {
        return RBChatConfig.FILE_HTTPS_URL + '/message/' + file_name
    }

    /**
     * 获得短视频消息的视频首帧预览图片文件下载服务的完整http地址.
     * <p>
     * 形如：“http://192.168.1.195:8080/rainbowchat/ShortVideoDownloader?user_uid=400007
     * &file_name=1aa7e1cc0405e3d5a52ae25d9eb6fbbb.jpg&file_md5=1aa7e1cc0405e3d5a52ae25d9eb6fbbb”。
     *
     * @param {String} thumbImageFileName 要下载的图片文件名
     * @param {String} videofileMd5 要下载的视频文件md5码
     * @return {String} 完整的http文件下载地址
     */
    function _getShortVideoThumbDownloadURL(thumbImageFileName, videofileMd5) {
        var fileURL = RBChatConfig.SHORTVIDEO_THUMB_DOWNLOADER_CONTROLLER_URL_ROOT
            + "?"
            // 要下载文件的本地用户uid（非必须参数）
            + "user_uid=" + IMSDK.getLoginInfo().loginUserId
            + "&thumb_image_file_name=" + thumbImageFileName
            + "&video_file_md5=" + videofileMd5
            + "&default_thumb_if_no=1";
        return fileURL;
    }

    /**
     * 获得消息聊天中“位置”消息的预览图（用于聊天气泡中）。
     *
     * 见高德地图官方文档：http://lbs.amap.com/api/webservice/guide/api/staticmaps
     *
     * @param {double} longitude 经度（double值，形如：120.646825）
     * @param {double} latitude 纬度（double值，形如：31.404756）
     * @retrun {String} 返回形如：“https://restapi.amap.com/v3/staticmap?location=120.646825,31.404756&zoom=14&scale=2&size=283*100&key=4fb238d0544f80f40fb3cd057d268a5f”
     */
    function _getLocationPreviewImgDownloadURL(longitude, latitude) {
        var fileURL = "https://restapi.amap.com/v3/staticmap?location=" + longitude + "," + latitude
            + "&zoom=14&scale=2&size=283*100&key=" + RBChatConfig.GAODE_MAP_WEB_STATIC_MAP_KEY;
        return fileURL;
    }

    /**
     * 获得下载指定个人照片的2进制数据的完整http地址.
     * <p>
     * 形如：“http://192.168.88.138:8080/BinaryDownloader?
     * action=photo_d&user_uid=400007&file_name=91c3e0d81b2039caa9c9899668b249e8.jpg”。
     *
     * @param {String} file_name 要下载的照片文件名
     * @return {String} 完整的http文件下载地址
     */
    function _getPhotoDownloadURL(file_name) {
        var fileURL = RBChatConfig.BBONERAY_DOWNLOAD_CONTROLLER_URL_ROOT
            + "?action=photo_d"
            // 要下载图片的用户uid
            + "&user_uid=" + IMSDK.getLoginInfo().loginUserId
            + "&file_name=" + file_name
            + "&one_pixel_black_if_no=1";
        return fileURL;
    }

    /**
     * 获得下载指定个人介绍语音留言文件的声音2进制数据的完整http地址.
     * <p>
     * 形如：“http://192.168.88.138:8080/BinaryDownloader?
     * action=pvoice_d&user_uid=400007&file_name=120_91c3e0d81b2039caa9c9899668b249e8.amr”。
     *
     * @param {String} file_name 要下载的语音留言文件名
     * @return {String} 完整的http文件下载地址
     */
    function _getPVoiceDownloadURL(file_name) {
        var fileURL = RBChatConfig.BBONERAY_DOWNLOAD_CONTROLLER_URL_ROOT
            + "?action=pvoice_mp3_d"
            // 要下载语音文件的用户uid
            + "&user_uid=" + IMSDK.getLoginInfo().loginUserId
            + "&file_name=" + file_name;
        return fileURL;
    }

    /**
     * 保存或清空本地用户的完整个人信息到cookie中。
     *
     * 说明：一个典型的IM系统的登陆，通常会分为2步：即1）通过http的sso单点接口认证身份并返回合
     *      法身份数据、2）将认证后的身份信息（主要是loginUserId和token）提交给IM服务器，再由
     *      IM服务器进行IM长连接的合法性检查，进而决定是否允许此次socket长连接的建立.
     *
     * @param {RosterElementEntity} userInfoObj 本参数为空则表示清除，否则表示保存，本对象对应于服务端Java
     * 类RosterElementEntity (http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro
     *                          /com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html)
     */
    function _saveAuthedLocalUserInfoToCookie(userInfoObj) {
        // 保存本地用户完整认证信息
        if (userInfoObj) {
            var expireDateTime = new Date();
            expireDateTime.setTime(expireDateTime.getTime() + COOKIE_KEY_AUTHED_LOCAL_USER_INFO_$EXPIRETIME);
            // 保存至cookie
            $.cookie(COOKIE_KEY_AUTHED_LOCAL_USER_INFO_ID
                , JSON.stringify(userInfoObj), { expires: expireDateTime, path: '/' }); // 所有路径都能读取
        }
        // 清除本地用户信息
        else {
            $.removeCookie(COOKIE_KEY_AUTHED_LOCAL_USER_INFO_ID, { path: '/' });
            //location.reload();
        }

        ////　debug
        //var localUerInfo = getAuthedLocalUserInfoFromCookie();
        //if(localUerInfo)
        //    RBChatUtils.logToConsole('>>>>>>>>>>>>>>>>>>>>>>>>>>> '+localUerInfo.whatsUp);
    }

    /**
     * 获得cookie中保存的本地用户完整信息对象。
     *
     * 说明：一个典型的IM系统的登陆，通常会分为2步：即1）通过http的sso单点接口认证身份并返回合
     *      法身份数据、2）将认证后的身份信息（主要是loginUserId和token）提交给IM服务器，再由
     *      IM服务器进行IM长连接的合法性检查，进而决定是否允许此次socket长连接的建立.
     *
     * @returns {RosterElementEntity} 如果成功取出，则返回的是对应于服务端Java
     * 类RosterElementEntity对象 (http://docs.52im.net/extend/docs/api/rainbowchatserver4_pro
     *                          /com/x52im/rainbowchat/http/logic/dto/RosterElementEntity.html)
     */
    function _getAuthedLocalUserInfoFromCookie() {
        var localUserInfoJSONString = $.cookie(COOKIE_KEY_AUTHED_LOCAL_USER_INFO_ID);
        if (localUserInfoJSONString)
            return JSON.parse(localUserInfoJSONString);

        // 读取本地用户完整认证信息
        return null;
    }

    /**
     * 设置的应用全局“是否开启声音提醒”开关值。
     * 注意：本开关是全局开关，一旦关闭，所有声音提示都会无条件被关闭。
     *
     * @param {boolean} msgToneOpen true表示开启，false表示关闭
     */
    function _setMsgToneOpenToCookie(msgToneOpen) {
        // 保存配置信息
        var expireDateTime = new Date();
        expireDateTime.setTime(expireDateTime.getTime() + COOKIE_KEY_MSG_TONE_$EXPIRETIME);
        // 保存至cookie
        $.cookie(COOKIE_KEY_MSG_TONE_ID, msgToneOpen ? '1' : '0', { expires: expireDateTime, path: '/' }); // 所有路径都能读取
    }

    /**
     * 用户最近设置的应用全局“是否开启声音提醒”开关值。
     * 注意：本开关是全局开关，一旦关闭，所有声音提示都会无条件被关闭。
     *
     * @return {boolean} YES表示已开启，否则表示已关闭，未设置则默认返回true
     */
    function _isMsgToneOpenFromCookie() {
        var toneString = $.cookie(COOKIE_KEY_MSG_TONE_ID);
        if (toneString)
            return '1' == toneString;

        // 读取本地用户完整认证信息
        return true;
    }

    /**
     * 去掉字符串左右的所有空格。
     *
     * @param {String} s
     * @returns {*}
     * @since 1.3
     */
    var _trim = function (s) {
        if (s)
            return s.replace(/(^\s*)|(\s*$)/g, "");
        else
            return s;
    };

    /**
     * 指定对象是否是String对象。
     *
     * 本方法主要用于JS对象转JSON字符串时，如果判定此对象就是String，那
     * 就不用转JSON字串了（因为它本身就是字串啊），不重复转就不会导致服务
     * 端解析出问题。
     *
     * @param {Object} obj
     * @returns {boolean} true表示是字符串对象，否则不是
     */
    var _isString = function (obj) {
        return (typeof obj == 'string') && obj.constructor == String;
    };

    /**
     * 是否是空字符串。
     *
     * @param {Object} obj 此字符串对象可能是服务端通过json返回的null空字段转成的"null"字串，也可能是js里的其它“空”字串情况
     * @returns {boolean} true表示是空字串，否则不空
     */
    var _isStringEmpty = function (obj) {
        return (obj === null || typeof (obj) === 'undefined' || obj === '' || obj === 'null');
    };

    var _stringIsEmail = function (str) {
        var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        return reg.test(str);
    };

    var _stringIsInt = function (str) {
        var reg = /^[0-9]*$/;
        return reg.test(str);
    };

    /**
     * 对Date的扩展，将 Date 转化为指定格式的String。
     *
     *  月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     *  年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)。
     *
     *  【示例】：
     *  common.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
     *  common.formatDate(new Date(), 'yyyy-M-d h:m:s.S')      ==> 2006-7-2 8:9:4.18
     *  common.formatDate(new Date(), 'hh:mm:ss.S')            ==> 08:09:04.423
     *
     *  @param {Date} date Date对象
     *  @param {String} fmt 格式字符串
     *  @param {String} 格式化的字符串
     */
    var _formatDate = function (date, fmt) { //author: meizz
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    /**
     * 获取浏览器的名称和版本号信息（主要用于Log记录等非关键数据时）.
     *
     * @return {String} 返回形如“chrome 70.0.3538.110”这样的字符串
     */
    var _getBrowserInfo = function () {
        var browser = {
            msie: false,
            firefox: false,
            opera: false,
            safari: false,
            chrome: false,
            netscape: false,
            appname: 'unknown',
            version: 0
        },
            ua = window.navigator.userAgent.toLowerCase();
        if (/(msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(ua)) {
            browser[RegExp.$1] = true;
            browser.appname = RegExp.$1;
            browser.version = RegExp.$2;
        } else if (/version\D+(\d[\d.]*).*safari/.test(ua)) {
            // safari
            browser.safari = true;
            browser.appname = 'safari';
            browser.version = RegExp.$2;
        }
        return browser.appname + ' ' + browser.version;
    };

    /**
     * 返回浏览器的精确信息（主要用于兼容性判定等情况下）。
     *
     * 本函数复制自Layui工程，详见：https://github.com/sentsin/layui/blob/master/src/layui.js
     *
     * @param {String} key
     * @return {Object} 返回形如：“{"os":"mac","ie":false,"weixin":false,"android":false,"ios":false}”
     * @since 1.5
     */
    var _device = function (key) {
        var agent = navigator.userAgent.toLowerCase()

            //获取版本号
            , getVersion = function (label) {
                var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
                label = (agent.match(exp) || [])[1];
                return label || false;
            }

            //返回结果集
            , result = {
                os: function () { //底层操作系统
                    if (/windows/.test(agent)) {
                        return 'windows';
                    } else if (/linux/.test(agent)) {
                        return 'linux';
                    } else if (/iphone|ipod|ipad|ios/.test(agent)) {
                        return 'ios';
                    } else if (/mac/.test(agent)) {
                        return 'mac';
                    }
                }()
                , ie: function () { //ie版本
                    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
                        (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
                    ) : false;
                }()
                , weixin: getVersion('micromessenger')  //是否微信
            };

        //任意的key
        if (key && !result[key]) {
            result[key] = getVersion(key);
        }

        //移动设备
        result.android = /android/.test(agent);
        result.ios = result.os === 'ios';

        return result;
    };

    /**
     * 播放一段音频。
     *
     * 本函数借鉴自layim，感谢原作者。
     *
     * @param {String} audioUrl 音频文件url
     * @since 1.5
     */
    let msg_timer = null;
    var _playAudio = function (audioUrl) {

        if ('../../audio/audio_msg.mp3' == audioUrl) {
            if (msg_timer) {
                clearTimeout(msg_timer)
                msg_timer = null;
            }
            msg_timer = setTimeout(function () {
                let msg = new SpeechSynthesisUtterance("您有新消息");
                window.speechSynthesis.speak(msg)
            }, 500)

        } else {
            var device = _device();
            // IE 9以下还播个球球。。
            if (device.ie && device.ie < 9) return; // 如果用在移动端，可以注释掉本行

            var audio = document.createElement("audio");
            audio.src = audioUrl;

            audio.play().then((res) => {
			})
            // .catch((error) => {
            //     // 防止重复触发
            //     if (window._audioDialog) return
            //     window._audioDialog = 1
            //     const dialogId = RBChatDialogHelper.nextDialogId();
            //     RBChatDialogHelper.showDialog("提示"
            //         , "取消"
            //         , "保存"
            //         , '<p style="padding-bottom: 10px;color: red;">由于浏览器限制，声音无法自动播放，请关闭弹窗即可授权播放</p>'
            //         , dialogId
            //         , null
            //         , null
            //         , false
            //         , "min-width: 500px;"
            //         , null
            //         , false
            //         , false);
            // });
        }

        ;
    };

    /**
     * 将字符串解析成日期。
     *
     * 【示例】：
     * parseDate('2016-08-11'); // Thu Aug 11 2016 00:00:00 GMT+0800
     * parseDate('2016-08-11 13:28:43', 'yyyy-MM-dd HH:mm:ss') // Thu Aug 11 2016 13:28:43 GMT+0800
     *
     * @param {String} str 输入的日期字符串，如'2014-09-13'
     * @param {String} fmt 字符串格式，默认'yyyy-MM-dd'，支持如下：y、M、d、H、m、s、S，不支持w和q
     * @returns {Date} 解析后的Date类型日期
     */
    var _parseDate = function (str, fmt) {
        fmt = fmt || 'yyyy-MM-dd';
        var obj = { y: 0, M: 1, d: 0, H: 0, h: 0, m: 0, s: 0, S: 0 };
        fmt.replace(/([^yMdHmsS]*?)(([yMdHmsS])\3*)([^yMdHmsS]*?)/g, function (m, $1, $2, $3, $4, idx, old) {
            str = str.replace(new RegExp($1 + '(\\d{' + $2.length + '})' + $4), function (_m, _$1) {
                obj[$3] = parseInt(_$1);
                return '';
            });
            return '';
        });
        obj.M--; // 月份是从0开始的，所以要减去1
        var date = new Date(obj.y, obj.M, obj.d, obj.H, obj.m, obj.s);
        if (obj.S !== 0) date.setMilliseconds(obj.S); // 如果设置了毫秒
        return date;
    };

    /**
     * 用于显示log信息，方便调试。
     *
     * 【补充说明】：在当前的演示代码中，本函数将被MobileIMSDK-Web框架回调，请见IMSDK.callback_log 回调函数的设置。
     * 【建议用途】: 开发者可在此回调中按照自已的意图打印MobileIMSDK-Web框架中的log，方便调试时使用。
     *
     * @param {String} message 要显示的Log内容
     * @param {boolean} toConsole true表示显示到浏览器的控制台，否则直接显示到网页前端
     */
    var _log = function (message, toConsole) {

        var logMsg = '☢ [' + _formatDate(new Date(), 'MM/dd hh:mm:ss.S') + '] ' + message;
        // if (toConsole) {
        //     console.info(logMsg);
        // }
        //else {
        //    // 已登陆则将信息显示在聊天界面
        //    if(IMSDK.isLogined()) {
        //        //添加系统消息
        //        var html = '';
        //        html += '<div class="msg-system">';
        //        html += logMsg;
        //        html += '</div>';
        //        var section = d.createElement('section');
        //        section.className = 'system J-mjrlinkWrap J-cutMsg';
        //        section.innerHTML = html;
        //        $messages.append(section);
        //        scrollToBottom();
        //    }
        //    // 未登陆时则将信息显示在登陆框下方的提示区
        //    else {
        //        showLoginHint(message);
        //    }
        //}
    };

    var _logToConsole = function (message) {
        _logToConsole_INFO(message);
    };

    var _logToConsole_INFO = function (message) {
        _log('[INFO] ' + message, true);
    };

    var _logToConsole_DEBUG = function (message) {
        _log('[DEBUG] ' + message, true);
    };

    var _logToConsole_WARN = function (message) {
        _log('[WARN] ' + message, true);
    };

    var _logToConsole_ERROR = function (message) {
        _log('[ERROR] ' + message, true);
    };

    /**
     * 将时间戳转成时间字符串（用指定的时间日期格式）。
     *
     * @param {number} timestamp 时间戳值，形如：1505814353000（共13位）
     * @param {String} pattern 时间日期格式，形如“yyyy-MM-dd hh:mm”
     * @return {String} 返回转换后的时间字符串
     */
    var _utcTimestampToStringWithPattern = function (timestamp, pattern) {
        if (timestamp) {
            var newDate = new Date();
            newDate.setTime(timestamp);
            return _formatDate(newDate, pattern);
        }
    };

    /**
     * 将时间戳转成时间字符串。
     *
     * @param {number} timestamp 时间戳值，形如：1505814353000（共13位）
     * @return {String} 返回转换后的时间字符串，形如“2017-09-19 15:34”
     */
    var _utcTimestampToString = function (timestamp) {
        //if(timestamp){
        //    var newDate = new Date();
        //    newDate.setTime(timestamp);
        //    return formatDate(newDate, 'yyyy-MM-dd hh:mm');
        //}
        return _utcTimestampToStringWithPattern(timestamp, 'yyyy-MM-dd hh:mm');
    };

    /**
     * 在JS中返回当前系统的时间戳。
     *
     * @returns {number} 形如：1280977330748 的长整数
     * @private
     */
    var _getCurrentUTCTimestamp = function () {
        return new Date().getTime();
    };

    /**
     * 传入秒数，得到“mm:ss”样的字符串。
     * 目前主要用于短视频的视频时长时使用。
     *
     * @param {int} second 秒数
     * @return {String} 形如“0:10”这样的字符串，表示10秒时长的短视频
     * @since 7.1
     */
    var _getMMSSFromSS = function (second) {
        if (second) {
            var s = parseInt(second);// 需要转换的时间秒

            if (second < 0) {
                return "00:00";
            }

            var m = 0;// 分

            if (s > 60) {
                m = parseInt(s / 60);
                s = parseInt(s % 60);
            }

            var ss, mm, hh;
            if (s > 0) {
                ss = s.toString().length >= 2 ? s.toString() : "0" + s.toString();
            } else {
                ss = "00";
            }

            if (m > 0) {
                mm = m.toString().length >= 2 ? m.toString() : "0" + m.toString();
            } else {
                mm = "00"
            }

            var result = mm + ":" + ss;
            return result;
        }
        else {
            return "00:00";
        }
    };

    /**
     * 判断是否是手机域名访问
     */
    var _isMobile = function () {
        // return window.location.host.indexOf('h5.imnono.net') != -1 || window.location.host.indexOf('h5.nongzhiw.cn') != -1;
        return window.location.host.indexOf(RBChatConfig.H5_DOMAIN1) != -1 || window.location.host.indexOf(RBChatConfig.H5_DOMAIN2) != -1;
    }

    /**
     * 显示首页app
     */
    var _showFirstPageMinApp = function () {
        var localUserUid = LocalUserInfo.getUid();
        RBChatRestHelper.MyMinAppListFromServer(localUserUid, function (res) {
            const list = JSON.parse(res)
            if (list && list.length > 0) {
                $('.first-my-minapp').show();
                $('.first-my-minapp-row2').empty();
                window.minappJump = function (url, appId) {
                    if (confirm("您所选小程序即将在浏览器新窗口打开")) {
                        window.open(url, '_blank')
                    }
                }
                var contentHTML = '';
                list.forEach(item => {
                    contentHTML = contentHTML + "<div class='my-min-app-item' onclick=\"javascript:minappJump('" + item.appletUrl + "','" + item.appletId + "')\"> <img src='" + item.appletImage + "'/> <span>" + item.appletName + "</span></div>"
                })
                $('.first-my-minapp-row2').append(contentHTML)
            } else {
                $('.first-my-minapp').hide();
            }

        }, function (error) {

        })
    }


    // 图片轮播公共方法
    let items = '';
    window.cueIndex = null;
    window.imgListTotol = null;
    var _fimgList = function (imgList, index) {
        // console.log('imgList', imgList)

        if (imgList.length == 1) {
            $(".next").css({ 'display': 'none' });
            $(".prev").css({ 'display': 'none' });
        } else {
            $(".next").css({ 'display': 'flex' });
            $(".prev").css({ 'display': 'flex' });
        }
        if (index == 0) {
            $(".prev").css({ 'display': 'none' })
        }
        if (index == imgList.length - 1) {
            $(".next").css({ 'display': 'none' })
        }
        window.imgListTotol = imgList;
        window.cueIndex = index;
        $(".container").css({ 'display': 'flex' });
        $(".container_z").css({ 'display': 'flex' });
        $(".featured_c").click(function () {
            items = '';
            $(".container_z").css({ 'display': 'none' });
        })
        items += `<img src="${imgList[window.cueIndex]}" onerror=\"javascript: imgLoadError(this)\" onclick="event.stopPropagation();" />`
        $(".container").html(items);

        setTimeout(() => {
            $(".container").click(function () {
                items = '';
                $(".container_z").css({ 'display': 'none' });
            })
        })

        window.imgScale = 1
        return true
    }
    // 下一张图片
    $(".next").click(function () {
        window.imgScale = 1
        if (window.cueIndex + 1 == window.imgListTotol.length - 1) {
            $(".next").css({ 'display': 'none' })
        }
        if (window.cueIndex < window.imgListTotol.length - 1) {
            $(".prev").css({ 'display': 'block' })
            items = ''
            items += `<img src="${window.window.imgListTotol[cueIndex + 1]}" onerror=\"javascript: imgLoadError(this)\" onclick="event.stopPropagation();" />`
            window.cueIndex = window.cueIndex + 1
            $(".container").html(items)
            setTimeout(() => {
                $(".container").click(function () {
                    items = '';
                    $(".container_z").css({ 'display': 'none' });
                })
            })
            return true;
        }

    });
    // 上一张图片
    $(".prev").click(function () {
        window.imgScale = 1
        if (window.cueIndex == 1) {
            $(".prev").css({ 'display': 'none' })
        }
        if (window.cueIndex > 0) {
            $(".next").css({ 'display': 'block' })
            items = ''
            items += `<img src="${window.window.imgListTotol[cueIndex - 1]}" onerror=\"javascript: imgLoadError(this)\" onclick="event.stopPropagation();" />`
            window.cueIndex = window.cueIndex - 1
            $(".container").html(items)
            setTimeout(() => {
                $(".container").click(function () {
                    items = '';
                    $(".container_z").css({ 'display': 'none' });
                })
            })
            return true;
        }
    });

    // 放大
    $(".container_controls .fangda").click(function (e) {
       e.stopPropagation()
       window.imgScale += 0.1
       const img = document.querySelector('.container img')
       img.style.transform = `scale(${window.imgScale})`;
    });

    // 缩小
    $(".container_controls .suoxiao").click(function (e) {
       e.stopPropagation()
       window.imgScale -= 0.1
       const img = document.querySelector('.container img')
       img.style.transform = `scale(${window.imgScale})`;
    });
    
    // 监听滚轮事件
    var handleWheel = function (event) {
        const isCtrlPressed = event.ctrlKey;

        if (isCtrlPressed) {
            // 防止页面滚动
            event.preventDefault();

            // 获取滚动方向，向上滚动时 deltaY 为负数，向下滚动时为正数
            let delta = event.deltaY;

            // 缩放比例的调整，越小越灵敏
            const scaleFactor = 0.1;

            // 向上滚动放大，向下滚动缩小
            if (delta < 0) {
                window.imgScale += scaleFactor;  // 放大
            } else if (delta > 0) {
                window.imgScale -= scaleFactor;  // 缩小
            }

            // 限制缩放比例的范围
            if (window.imgScale < 0.5) window.imgScale = 0.5;
            if (window.imgScale > 3) window.imgScale = 3;

            document.querySelector('.container img').style.transform = `scale(${window.imgScale})`;
        }
    }
    
    // 绑定事件
    if (window.addEventListener) {
      window.addEventListener('wheel', handleWheel, { passive: false });
    } else {
      // 兼容老旧浏览器
      window.attachEvent('onmousewheel', handleWheel);
    }
    

    // 视频轮播公共方法
    let items_v = '';
    window.cueIndex_v = null;
    window.imgListTotol_v = null;
    var _fvideo = function (video, index) {
        window.cueIndex_v = index;
        window.imgListTotol_v = video;
        if (index == 0) {
            $(".prev_video").css({ 'display': 'none' })
        }
        if (index == video.length - 1) {
            $(".next_video").css({ 'display': 'none' })
        }
        $(".container_z_v").css({ 'display': 'flex' });
        $("#container_z_video").css({ 'display': 'flex' });
        $("#container_z_video").css({ 'height': '100%' });
        $(".featured_c").click(function () {
            items_v = ''
            $(".container_z_v").css({ 'display': 'none' });
            const video = document.querySelector('#container_z_video video');
            video.pause();
            video.parentNode.removeChild(video);
        })
        items_v += video[index].indexOf('m3u8')!=-1? ( `    
        <div id="dplayer">
        </div>
        `):( `    
        <video id="myVideo" controls poster="video.jpg" autoplay muted >
            <source src="${video[index]}" type="video/mp4" />
        </video>
        `)
           
        $("#container_z_video").html(items_v);
        if(video[index].indexOf('m3u8')!=-1){
            _init_m3u8_player(video[index])
        }
    }

    var _init_m3u8_player= function(url){
        let dp = new DPlayer({
            container: document.getElementById("dplayer"),
            live: false,
            autoplay: true,
            preload: 'auto',
            volume: 0,
            hotkey: false,
            lang: 'en',
            video: {
                url: url,
                type: 'customHls',
                customType: {
                    customHls: function (video, player) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                    },
                    customFlv: function (video, player) {
                        const flvPlayer = flvjs.createPlayer({
                            type: 'flv',
                            url,
                        });
                        flvPlayer.attachMediaElement(video);
                        flvPlayer.load();
                    },
                },
            },
        });
    }

    // 下一个视频
    $(".next_video").click(function () {
        if (window.cueIndex_v + 1 == window.imgListTotol_v.length - 1) {
            $(".next_video").css({ 'display': 'none' })
        }
        if (window.cueIndex_v <= window.imgListTotol_v.length - 1) {
            $(".prev_video").css({ 'display': 'block' })
            $("#container_z_video").empty();
            items_v = ''
            var video_url = window.imgListTotol_v[window.cueIndex_v + 1]
            items_v +=
            video_url.indexOf('m3u8')!=-1? ( `    
                        <div id="dplayer">
                        </div>
                `):( `    
                <video id="myVideo" controls poster="video.jpg" autoplay muted >
                    <source src="${video_url}" type="video/mp4" />
                </video>
                `)
            window.cueIndex_v = window.cueIndex_v + 1
            $("#container_z_video").html(items_v);
            if(video_url.indexOf('m3u8')!=-1){
                _init_m3u8_player(video_url)
            }
        }
    });
    // 上一个视频
    $(".prev_video").click(function () {
        if (window.cueIndex_v == 1) {
            $(".prev_video").css({ 'display': 'none' })
        }
        if (window.cueIndex_v > 0) {
            $(".next_video").css({ 'display': 'block' })
            $("#container_z_video").empty();
            items_v = ''
            items_v = ''
            var video_url = window.imgListTotol_v[window.cueIndex_v - 1]
            items_v +=
            video_url.indexOf('m3u8')!=-1? ( `    
                    <div id="dplayer">
                    </div>
                `):( `    
                <video id="myVideo" controls poster="video.jpg" autoplay muted >
                    <source src="${video_url}" type="video/mp4" />
                </video>
                `)
            window.cueIndex_v = window.cueIndex_v - 1
            $("#container_z_video").html(items_v);
            if(video_url.indexOf('m3u8')!=-1){
                _init_m3u8_player(video_url)
            }
        }
    });

    /**
     * 显示会话详情
     */
    var _showChatDetail = function () {
      //  if (_isMobile()) {
           // $('#phone_chat').show()
            $('#chat_top_back').unbind('click');
            $('#chat_top_back').click(function () {
              $('#im-panel-main-chatcontentpane-toplevel').css({ 'display': 'none' });
              $('#footer_i').css({ 'display': 'block' });
            })

            $('#chat_top_detail').unbind('click');
            var open = false;
            $('#container_info').hide();
            $('#chat_top_detail').click(function () {
                if (open) {
                    $('#container_info').hide();
                } else {
                    $('#container_info').show();
                }
                open = !open
            })

            $('#right_con_closure').unbind('click');
            var open = false;
            $('#container_info').hide();
            $('#right_con_closure').click(function () {
                if (open) {
                    $('#container_info').hide();
                } else {
                    $('#container_info').show();
                }
                open = !open
            })

            $('#left_con').unbind('click');
            var open = false;
            $('#container_info').hide();
            $('#left_con').click(function () {
                if (open) {
                    $('#container_info').hide();
                } else {
                    $('#container_info').show();
                }
                open = !open
            })
       // }
    }

    /**
     * 显示iframe
     * @param {*} url 
     * @param {*} callBack 
     */
    var _showIFrameURL = function (url, title, callBack) {
        var popupId = "im-panel-msg-popupmenu";
        var oldPopupObj = $("#" + popupId);
        // 如果已经存在则先删除之（jq里选择器选回对象的Length>0表示该元素是存在的）
        if (oldPopupObj.length > 0)
            oldPopupObj.remove();

        var phoneCss = ''
        if (_isMobile()) {
            url = url + '&isShowC=0'
            phoneCss = "style='width: 100%; height: 100%; top:0 !important;left:0 !important';"
            var html_ =
                ' <div id="' + popupId + '"  style="display: none;">'
                + '<div class=\'chat_top_1\'>' +
                '<div id=\'pop_ups_back\' class=\'redpck-show-chai-close_0\'><img id=\'left_jt\' src="images/im_b_img/left_jt_3.png" alt=""></div>' +
                '<div class=\'pop_title\'>' + title + '</div>' +
                '<div class=\'right_pop\'></div>' +
                '</div>'
                + '   <div  class=\'pc-iframe-pc\' ' + phoneCss + ' >'
                // + '       <img src=\'/images/red-close.png\' id=\'redpck-show-chai-close\'/>'
                + '       <iframe src=\'' + url + '&v=339' + '\'/ >'
                + '   </div>'
                + '</div>';
        } else {
            var html_ =
                '<div id="' + popupId + '"  style="display: none;">'
                + '   <div  class=\'pc-iframe-pc\' ' + phoneCss + ' >'
                + '       <img src=\'/images/red-close.png\' id=\'redpck-show-chai-close\'/>'
                + '       <iframe src=\'' + url + '&v=339' + '\'/ >'
                + '   </div>'
                + '</div>';
        }



        $(html_).appendTo('body');
        // 菜单对象
        var newPopupObj = $("#" + popupId);
        // 在鼠标点击的位置显示菜单
        if (_isMobile()) {
            newPopupObj.css({ "bottom": "0%", 'width': '100%', 'height': '100%' });
        } else {
            newPopupObj.css("top", "10%");
        }
        newPopupObj.css("left", _isMobile() ? "0%" : "35%");
        newPopupObj.css("z-index", "999");
        newPopupObj.show();

        //关闭
        $('#redpck-show-chai-close').click(function () {
            newPopupObj.remove();
        });
        //关闭
        $('.redpck-show-chai-close_0').click(function () {
            newPopupObj.remove();
        });


        window.removeEventListener('message', callBack);
        window.addEventListener('message', callBack);
    }


    /**
     * 仿照微信中的消息时间显示逻辑，将时间戳（单位：毫秒）转换为友好的显示格式.
     *
     * 1）7天之内的日期显示逻辑是：今天、昨天(-1d)、前天(-2d)、星期？（只显示总计7天之内的星期数，即<=-4d）；
     * 2）7天之外（即>7天）的逻辑：直接显示完整日期时间。

     * @param {[number]} timestamp 时间戳（单位：毫秒），形如：1550789954260
     * @param {boolean} mustIncludeTime true表示输出的格式里一定会包含“时间:分钟”
     * ，否则不包含（参考微信，不包含时分的情况，用于首页“消息”中显示时）
     * @param {String} timeWithSegmentStr 本参数仅在mustIncludeTime=true时有生效，表示在时间字符串前带上“上午”、“下午”、“晚上”这样的描述
     *
     * @return {String} 输出格式形如：“刚刚”、“10:30”、“昨天 12:04”、“前天 20:51”、“星期二”、“2019/2/21 12:09”等形式
     * @since 1.1
     */
    var _getTimeStringAutoShort2 = function (timestamp, mustIncludeTime, timeWithSegmentStr) {

        // 当前时间
        var currentDate = new Date();
        // 目标判断时间
        var srcDate = new Date(parseInt(timestamp));

        var currentYear = currentDate.getFullYear();
        var currentMonth = (currentDate.getMonth() + 1);
        var currentDateD = currentDate.getDate();

        var srcYear = srcDate.getFullYear();
        var srcMonth = (srcDate.getMonth() + 1);
        var srcDateD = srcDate.getDate();

        var ret = "";

        // 要额外显示的时间分钟
        var timeExtraStr = "";
        if (mustIncludeTime) {
            // var timeExtraStr = (mustIncludeTime ? " " + _formatDate(srcDate, "hh:mm") : "");
            timeExtraStr = " " + _getTimeHH24Human(srcDate, timeWithSegmentStr);
        }

        // 当年
        if (currentYear === srcYear) {
            var currentTimestamp = currentDate.getTime();
            var srcTimestamp = timestamp;
            // 相差时间（单位：毫秒）
            var deltaTime = (currentTimestamp - srcTimestamp);

            // 当天（月份和日期一致才是）
            if (currentMonth === srcMonth && currentDateD === srcDateD) {
                // // 时间相差60秒以内
                // if(deltaTime < 60 * 1000)
                //     ret = "刚刚";
                // // 否则当天其它时间段的，直接显示“时:分”的形式
                // else
                //     ret = _formatDate(srcDate, "hh:mm");

                // 当天只需要显示时间分钟，且必须显示“上午”、“下午”这样的时间段描述
                ret = _getTimeHH24Human(srcDate, true);
            }
            // 当年 && 当天之外的时间（即昨天及以前的时间）
            else {
                // 昨天（以“现在”的时候为基准-1天）
                var yesterdayDate = new Date();
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);

                // 前天（以“现在”的时候为基准-2天）
                var beforeYesterdayDate = new Date();
                beforeYesterdayDate.setDate(beforeYesterdayDate.getDate() - 2);

                // 用目标日期的“月”和“天”跟上方计算出来的“昨天”进行比较，是最为准确的（如果用时间戳差值
                // 的形式，是不准确的，比如：现在时刻是2019年02月22日1:00、而srcDate是2019年02月21日23:00，
                // 这两者间只相差2小时，直接用“deltaTime/(3600 * 1000)” > 24小时来判断是否昨天，就完全是扯蛋的逻辑了）
                if (srcMonth === (yesterdayDate.getMonth() + 1) && srcDateD === yesterdayDate.getDate())
                    ret = "昨天" + timeExtraStr;// -1d
                // “前天”判断逻辑同上
                else if (srcMonth === (beforeYesterdayDate.getMonth() + 1) && srcDateD === beforeYesterdayDate.getDate())
                    ret = "前天" + timeExtraStr;// -2d
                else {
                    // 跟当前时间相差的小时数
                    var deltaHour = (deltaTime / (3600 * 1000));

                    // 如果小于或等 7*24小时就显示星期几
                    if (deltaHour <= 7 * 24) {
                        var weekday = new Array(7);
                        weekday[0] = "星期日";
                        weekday[1] = "星期一";
                        weekday[2] = "星期二";
                        weekday[3] = "星期三";
                        weekday[4] = "星期四";
                        weekday[5] = "星期五";
                        weekday[6] = "星期六";

                        // 取出当前是星期几
                        var weedayDesc = weekday[srcDate.getDay()];
                        ret = weedayDesc + timeExtraStr;
                    }
                    // 否则直接显示完整日期时间
                    else
                        ret = _formatDate(srcDate, "M月d日") + timeExtraStr;
                }
            }
        }
        // 往年
        else {
            ret = _formatDate(srcDate, "yy年M月d日") + timeExtraStr;
        }

        return ret;
    };

    /**
     * 获取仅包含“时间:分钟”部分的字符串，24小时制，且可以显示“上午”、“下午”、“晚上”这样的描述。
     *
     * @param {Date} srcDateObj 原始日期对象
     * @param {boolean} timeWithSegmentStr 表示在时间字符串前带上“上午”、“下午”、“晚上”这样的描述
     * @return {String} 如果成功则返回结果，否则返回空字符串""（不是null）
     * @since 3.1
     */
    var _getTimeHH24Human = function (srcDateObj, timeWithSegmentStr) {

        var ret = "";

        try {
            var timePattern = "hh:mm";
            // 原始的时间分钟字符串
            var timeStr = _formatDate(srcDateObj, timePattern);

            // 时间段描述（形如：“上午”、“下午”、“晚上”这样的描述），只在中文语言下生效
            var timeSegmentStr = "";
            if (timeWithSegmentStr)
                timeSegmentStr = _getTimeSegmentStr(timeStr);

            // 组合成最终的人性化时间分钟字符串形式
            ret = timeSegmentStr + timeStr;
        } catch (e) {
            _logToConsole_WARN("【DEBUG-getTimeHH24Human】计算出错：" + e + " 【NO】");
        }

        return ret;
    };

    /**
     * 将一个两位24小时时间的转换为上午、下午这样的描述。
     *
     * @param {String} hh24 两位的24小时制时间的小时部分
     * @return {String} 如果成功转换则返回形如：“凌晨”、“上午”等，否则返回空字符串（不是null）
     * @since 3.1
     */
    var _getTimeSegmentStr = function (hh24) {
        var ret = "";
        if (hh24 != null && hh24.length >= 2) {
            try {
                // 取出“小时”部分
                var a = parseInt(hh24.substring(0, 2));
                if (a >= 0 && a <= 6) {
                    ret = "凌晨";
                }
                else if (a > 6 && a <= 12) {
                    ret = "上午";
                }
                else if (a > 12 && a <= 13) {
                    ret = "中午";
                }
                else if (a > 13 && a <= 18) {
                    ret = "下午";
                }
                else if (a > 18 && a <= 24) {
                    ret = "晚上";
                }
            } catch (e) {
                _logToConsole_WARN("【DEBUG-getTimeSegmentStr】计算出错：" + e + " 【NO】");
            }
        }

        return ret;
    };

    /**
     * 获得文件大小的人类可读字符串形式.
     *
     * @param {number} size 原文件大小，单位是byte(如表示该文件的长度是10240000)
     * @param {int} scale 小数点位数(达到TB级以后,小数点默认为2位)，保留一位小数本值填10、2位小数本值填100、以此类推
     * @return {String} 10240000字节的文件大小返回的字符串就是"10.00M"
     */
    var _getConvenientFileSize = function (size, scale) {
        var ret = size + "&nbsp;字节";

        if (!scale)
            scale = 1; // 为1表示不保留小数

        var temp = size / 1024.0;
        if (temp >= 1) {
            ret = (Math.round(temp * scale) / scale) + "&nbsp;KB";
            temp = temp / 1024.0;
            if (temp >= 1) {
                ret = (Math.round(temp * scale) / scale) + "&nbsp;MB";
                temp = temp / 1024.0;
                if (temp >= 1) {
                    ret = (Math.round(temp * scale) / scale) + "&nbsp;GB";
                    temp = temp / 1024.0;
                    if (temp >= 1)
                        ret = (Math.round(temp * scale) / scale) + "&nbsp;TB";
                }
            }
        }

        return ret;
    };

    /**
     * 更新群头像 
     * @param {*} gid 
     */
    var _updateGroupAvatar = function (gid, isGroup = true) {
        const url = isGroup ? RBChatUtils.getGroupAvatarDownloadURL(gid, false) : RBChatUtils.getUserAvatarDownloadURL(gid, false)
        // 群组列表
        if (isGroup) {
            const errorTxt = $("#kchat-im-panel-userlist-groups li[im-date='" + gid + "'] div[class='avatar-source human']").children().eq(1).attr('onerror');
            if (errorTxt) {
                $("#kchat-im-panel-userlist-groups li[im-date='" + gid + "'] div[class='avatar-source human']").children().eq(1).attr('src', url)
            } else {
                const t = $("#kchat-im-panel-userlist-groups li[im-date='" + gid + "'] div[class='avatar-source human']").children().eq(0)

                t.after("<img  src=\'" + url + "\' onerror='javascript:$(this).remove()' >")
            }
            //更新当前群的头像
            var dom = document.getElementById('im-panel-main-rightdetail-content-group-default-avatar-' + gid);
            if (dom) {
                const lt = $('#im-panel-main-rightdetail-content-group-default-avatar-' + gid).parent().children();
                if (lt.length > 1) {
                    lt.eq(1).attr('src', url)
                } else {
                    $('#im-panel-main-rightdetail-content-group-default-avatar-' + gid).after("<img  src=\'" + url + "\' onerror='javascript:groupTTnotFound($(this))' >")
                }
            }

            //好友头像
        } else {
            const errorTxt = $("#kchat-im-panel-userlist-roster li[im-date='" + gid + "'] div[class='avatar-source human']").children().eq(1).attr('onerror');
            if (errorTxt) {
                $("#kchat-im-panel-userlist-roster li[im-date='" + gid + "'] div[class='avatar-source human']").children().eq(1).attr('src', url)
            } else {
                const t = $("#kchat-im-panel-userlist-roster li[im-date='" + gid + "'] div[class='avatar-source human']").children().eq(0)

                t.after("<img  src=\'" + url + "\' onerror='javascript:$(this).remove()' >")
            }
            //更新当前用户头像
            var dom = document.getElementById('im-panel-main-rightdetail-content-user-default-avatar-' + gid);
            if (dom) {
                const lt = $('#im-panel-main-rightdetail-content-user-default-avatar-' + gid).parent().children().eq(1);
                lt.attr('href', url)
                if (lt.children().length > 0) {
                    lt.children().eq(0).attr('src', url)
                } else {
                    lt.append("<img  src=\'" + url + "\' onerror=\'javascript:userActttnotFound($(this))\' >")
                }
            }
        }

        // 会话列表
        const errorTxt2 = $("#kchat-im-panel-userlist-alarms li[im-dataid='" + gid + "'] div[class='avatar-source human']").children().eq(1).attr('onerror');
        if (errorTxt2) {
            $("#kchat-im-panel-userlist-alarms li[im-dataid='" + gid + "'] div[class='avatar-source human']").children().eq(1).attr('src', url)
        } else {
            const t = $("#kchat-im-panel-userlist-alarms li[im-dataid='" + gid + "'] div[class='avatar-source human']").children().eq(0)

            t.after("<img src=\'" + url + "\' onerror='javascript:$(this).remove()' >")
        }
    }

    /**
     * 获取指定文件名的扩展名。
     *
     * @param {String} fileName
     * @returns {String} 如果成功取出则返回扩展名，否则返回null
     * @private
     */
    var _getFileExtName = function (fileName) {
        var extName = null;
        if (fileName) {
            var index = fileName.lastIndexOf(".");
            var suffix = fileName.substring(index + 1);

            if (suffix) {
                extName = suffix.toLocaleLowerCase();
            }
        }

        return extName;
    };


    /**
     * 设置置顶/免打扰
     * @param {*} key 
     */
    var _setKeyVal = function (key, val) {
        let l = localStorage.getItem(key);
        if (!l) {
            l = []
        } else {
            l = JSON.parse(l);
        }
        l.push(val)
        localStorage.setItem(key, JSON.stringify(l))
    }

    /**
     * 取消置顶/免叨扰
     * @param {*} key 
     */
    var _cancleKeyVal = function (key, val) {
        const l = localStorage.getItem(key);
        if (l) {
            const ll = JSON.parse(l);
            const index = ll.indexOf(val);
            if (index > -1) {
                ll.splice(index, 1);
                localStorage.setItem(key, JSON.stringify(ll))
            }
        }
    }

    /**
     * 是否置顶/免打扰
     * @param {*} key 
     * @returns 
     */
    var _isKeyVal = function (key, val) {
        let top = false;
        const l = localStorage.getItem(key);
        if (l) {
            const ll = JSON.parse(l);
            const index = ll.indexOf(val);
            top = index > -1;
        }
        return top;
    }

    /**
     * 返回指定语音文件名中包含的语音时长数据.
     * <p>
     * 注：此文件名指的是最终发送的和接收的语音文件名，而非临时文件名（临时文件名没有时长信息）.
     *
     * @param {String} voiceFileName 形如：120000_ad3434fdsfsd432432fsdfs.amr的语音文件名，120000是语音时长（单位：毫秒）
     * @return {Number} 解析出的语音时长（单位：秒）
     */
    var _getDurationFromVoiceFileName = function (voiceFileName) {
        var duration = 0;
        if (voiceFileName && voiceFileName.indexOf("_") != -1) {
            var durationInMillsecond = voiceFileName.substring(0, voiceFileName.indexOf("_"));

            if (durationInMillsecond) {
                // 返回的时长需要转换成秒（而非毫秒）
                duration = parseInt(durationInMillsecond / 1000);
            }
        }
        return duration;
    };


    /**
     *  绘制多张图片
     * @param {*} imgs_list 
     */
    var _draw_mul_pic = function(imgs_list,isVideo=false){
            var chunkSize = function(arr, size) {
                var arr2=[];
                for(var i=0;i<arr.length;i=i+size){
                arr2.push(arr.slice(i,i+size));
                }
                return arr2;
            }

            var  content_html = ''
            // 获取一个图片 
            var get_img_url = function(fileMd5, style){
                if(isVideo){
                    // return "<a target=\"_blank\" href=\"javascript:void(0)\" onclick=\"javascript:videoSwiperListUI('" + RBChatUtils.getImageDownloadURL(fileMd5, false) + "');return false\"><div style='display: flex;position: relative;justify-content: center;align-items: center;'><img src='" + RBChatUtils.getImageDownloadURL(fileMd5, false) + "?ci-process=snapshot&time=0.01" + "' style='"+style+"'/><img class='play' src='images/common_short_video_player_continue_play_ico_nor.png'/></div></a>"
                    return `
                        <a 
                            target="_blank" 
                            href="javascript:void(0)" 
                            onclick="javascript:videoSwiperListUI('${RBChatUtils.getImageDownloadURL(fileMd5, false)}'); return false"
                        >
                            <div 
                                style="display: flex;
                                    position: relative;
                                    justify-content: center;
                                    align-items: center;">
                                <img 
                                    src="${RBChatUtils.getImageDownloadURL(fileMd5, false)}?ci-process=snapshot&time=0.01" 
                                    style="${style}" />
                                <img class="play" src="images/common_short_video_player_continue_play_ico_nor.png" />
                                <div 
                                    onclick="event.stopPropagation(); event.preventDefault(); RBChatUtils.copyToClipboard('iOS专属链接：${RBChatUtils.getImageDownloadURL(fileMd5, false)}')" 
                                    style="position: absolute; bottom: 10px; left: 0; right: 0; margin: 0 auto; width:64px; height:25px; border:1px solid rgba(255,255,255,0.77); border-radius: 13px; background: rgba(28,28,28,0.50); font-size: 12px; color: #FFFFFF; font-weight: 600; display:flex; align-items:center; justify-content:center;">复制链接</div>
                            </div>
                        </a>`;

                }
                return "<a target=\"_blank\" href=\"javascript:void(0)\" onclick=\"javascript:imgSwiperListUI('" + RBChatUtils.getImageDownloadURL(fileMd5, false) + "');return false\"><img src='" + RBChatUtils.getImageDownloadURL(fileMd5, false)+ "' onerror=\"javascript: imgLoadError(this)\" style='"+style+"'/></a>"
            }
            // 2张内
            if(imgs_list.length == 1 || imgs_list.length == 2){
                content_html = "<div class='item' style='justify-content: center;'>"+ imgs_list.map((item,index) =>{
                    return ""+get_img_url(item.fileMd5, 'width:170px;height:250px;'+(index!=0 ? 'margin-left:5px':''))+""
                }).join('')
                +"</div>"
            // 3张
            }else if(imgs_list.length == 3){

                var img_left = "<div style='display:flex;'>"+get_img_url(imgs_list[0].fileMd5, 'width:250px;height:370px;')+"</div>"
                var right_per_height = (370-5)/2; 
                var img_right = "<div style='display:flex;flex-direction: column;margin-left:5px;'>"+get_img_url(imgs_list[1].fileMd5, 'width:100px;height:'+right_per_height+'px;margin-bottom:5px')+get_img_url(imgs_list[2].fileMd5, 'width:100px;height:'+right_per_height+'px;')+"</div>"

                content_html ="<div class='item' style='display:flex;'>"+img_left+img_right+"</div>"
            // 4张
            }else if(imgs_list.length == 4){
                var img_left = "<div style='display:flex;'>"+get_img_url(imgs_list[0].fileMd5, 'width:250px;height:370px;')+"</div>"
                var right_per_height = (370-10)/3
                var img_right = "<div style='display:flex;flex-direction: column;margin-left:5px;'>"+get_img_url(imgs_list[1].fileMd5, 'width:100px;height:'+right_per_height+'px;margin-bottom:5px')+get_img_url(imgs_list[2].fileMd5, 'width:100px;height:'+right_per_height+'px;margin-bottom:5px')+get_img_url(imgs_list[3].fileMd5, 'width:100px;height:'+right_per_height+'px;')+"</div>"
                content_html ="<div class='item' style='display:flex;'>"+img_left+img_right+"</div>"
            // 5张
            }else if(imgs_list.length == 5){
                var right_per_width = (350-5)/2
                var img_top = "<div style='display:flex;'>"+get_img_url(imgs_list[0].fileMd5, 'width:'+right_per_width+'px;height:200px;margin-right:5px')+get_img_url(imgs_list[1].fileMd5, 'width:'+right_per_width+'px;height:200px;')+"</div>"
                right_per_width = (350-10)/3
                var img_bottom = "<div style='display:flex;margin-top:5px;'>"+get_img_url(imgs_list[2].fileMd5, 'width:'+right_per_width+'px;height:120px;margin-right:5px')+get_img_url(imgs_list[3].fileMd5, 'width:'+right_per_width+'px;height:120px;margin-right:5px')+get_img_url(imgs_list[4].fileMd5, 'width:'+right_per_width+'px;height:120px;')+"</div>"
                content_html ="<div class='item' style='display:flex;flex-direction: column'>"+img_top+img_bottom+"</div>"
            }else{
                //剩下了多少个,再最后一个数组
                var lost_num = imgs_list.length %3;
                // 分割出来了多少个数组  11  0:3,1:3,2:3,3:2
                var result_list = chunkSize(imgs_list,3)
                var len = result_list.length;
                if(lost_num != 0){
                    const last_array = result_list[len-1]
                    if(lost_num == 1){
                         result_list[len-2].push(last_array[0])  
                         // 删除最后一个元素
                        result_list.pop()
                    }
                    
                }
                
                content_html ="<div class='item' style='display:flex;flex-direction: column'>"
                //绘制ui
                var rows_html = result_list.map((item,i)=>{
                    var len = item.length;
                    var perWidth = (350- (len-1)*5)/len
                    var row_html = "<div style='display:flex;"+(i != 0 ?"margin-top:5px;":"")+"'>"
                    var imgs_html = ''
                    if(len == 2){
                        var right_per_width = (350-5)/2
                        imgs_html = item.map((item_,index)=>{
                            return  get_img_url(item_.fileMd5, 'width:'+right_per_width+'px;height:200px;' +(index != 0 ? '':'margin-right:5px'))        
                        }).join('')
                    }else{
                        imgs_html = item.map((item_,index)=>{
                            return  get_img_url(item_.fileMd5, 'width:'+perWidth+'px;height:'+(len == 4? 120:200)+'px;'+(index != 0 ? 'margin-left:5px':''))         
                        }).join('')
                    }
                   
                    row_html += imgs_html+'</div>'
                    return row_html
                }).join('')
                content_html += rows_html+'</div>'

            }
            return content_html
    }

    /**
     * 用途：js中字符串超长作固定长度加省略号（...）处理
     *
     * @param {String} str 需要进行处理的字符串
     * @param {int} maxLen 需要显示多少个字（当参数 surpportChinese=true时，本参数指明的长度中1个汉字占一个长度，否则占2个长度）
     * @param {boolean} surpportChinese true表示汉字作不"1"个长度计算，否则汉字按“2”个字节长度计算
     * @returns {String}
     * @private
     */
    var _beautySubstring = function (str, maxLen, surpportChinese) {
        if (surpportChinese) {
            var reg = /[\u4e00-\u9fa5]/g,    //专业匹配中文
                slice = str.substring(0, maxLen),
                chineseCharNum = (~~(slice.match(reg) && slice.match(reg).length)),
                realen = slice.length * 2 - chineseCharNum;
            return str.substr(0, realen) + (realen < str.length ? "..." : "");
        }
        else {
            return str.substr(0, maxLen) + (maxLen < str.length ? "..." : "");
        }
    };

    /**
     * 用途：用于首页“消息”列表的Item内容中，将开头为“[文件]”、“[位置]”、“[个人名片]”等“[xxxxx]”占位符形式的内容，
     * 替换为一个橙色的span，目的是为了ui上更美化、更好看一些，仅此而已。
     *
     * 用处：详见 rbchat_ui_module.js文件中的 UIModule4.prototype.insertItem()和 UIModule4.prototype.updateItemContent()函数中。
     *
     * @param {String} contentToShow 原始的显示内容
     * @returns {String}
     * @private
     */
    var _replacePlaceholderForAlarmsItemContent = function (contentToShow) {
        var contentToShowAfter = contentToShow;
        if (contentToShowAfter) {
            // 匹配占位符，占位符形如“[文件]”、“[位置]”等
            var regexp = /^\[[^\[|^\]]+\]/;
            var m = contentToShowAfter.match(regexp);
            if (m) {
                var m0 = m[0];
                contentToShowAfter = contentToShowAfter.replace(regexp, "<span class='msg-flag-orange'>" + m0 + "</span>");
            }
        }

        return contentToShowAfter;
    };

    /**
     * 复制指定元素的文本内容到系统剪贴板。
     *
     * @param elementId {String} html元素的id值
     * @return true表示复制成功
     */
    var _copyText = function (elementId) {
        var text = document.getElementById(elementId);

        var canCopy = false;
        if (document.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
            canCopy = true;
        } else if (window.getSelection) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
            canCopy = true;
        } else {
            _logToConsole_WARN("无法复制内容到系统剪贴板！");
        }

        if (canCopy) {
            document.execCommand('Copy', 'false', null);
            return true;
        }
        return false;
    };

    var  _copyToClipboard = function(text) {
        // console.log('_copyToClipboard', {text});
        let _text = text.replace(/(https?:\/\/)[^/]+/, window._VIDEO_HTTPS_URL); // 地址主要国内用，需替换成国内地址
        
        const tempInput = document.createElement('textarea'); // 创建一个临时的文本区域
        document.body.appendChild(tempInput); // 添加到页面中
        tempInput.value = _text; // 设置要复制的内容
        tempInput.select(); // 选中内容
        document.execCommand('copy'); // 执行复制命令
        document.body.removeChild(tempInput); // 删除临时文本区域
        alert('复制成功！');
    }



    /**
     * 获取好友的备注昵称，当设置了好友备注时则返回的是备注，否则返回的是原昵称。
     *
     * @param ree {RosterElementEntity} 用户数据对象
     * @return 返回好友备注优先的昵称
     */
    function _getNickNameWithRemark(ree) {
        var ret = "";
        if (ree) {
            if (_isStringEmpty(_trim(ree.friendRemark))) {
                ret = ree.nickname;
            }
            else {
                ret = ree.friendRemark;
            }

            if (_isStringEmpty(ret))
                ret = ree.user_uid;
        }
        return ret;
    }

    /**
     * FFF 获取光标所在位置
     * @param eleObj 所在的元素的jquery对象
     * @private
     */
    function _getCursorPos(eleObj) {
        var el = eleObj.get(0);//将jquery对象转为html元素
        var pos = 0;
        if ('selectionStart' in el) { // IE
            pos = el.selectionStart;
        } else if ('selection' in document) { // Mozilla
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        // console.log('---pos=' + pos);
        return pos;
    }

    /**
     * FFF 设置光标到指定位置
     * @param eleObj 所在的元素的jquery对象
     * @param position 光标将要设置的位置
     * @private
     */
    function _setCursorPos(eleObj, position) {
        var el = eleObj.get(0);//将jquery对象转为html元素
        if ($.browser.msie) {
            var range = el.createTextRange();
            range.move("character", position);
            range.select();
        }
        else {
            //obj.setSelectionRange(startPosition, endPosition);
            el.setSelectionRange(position, position);
            el.focus();
        }
    }

    /**
     * FFF 对指定的元素在当前焦点处插入文字
     * @param eleObj  所在的元素的jquery对象，该元素须是表单元素
     * @param str 要插入的文本内容
     * @return number 返回最新输入位置
     * @private
     */
    function _insertAtCursor(eleObj, str) {
        var pos = _getCursorPos(eleObj);
        var v = eleObj.val();//元素中原来的文本内容
        var v1 = v.substring(0, pos); //光标前的文本
        var v2 = v.substring(pos); // 光标后的文本
        eleObj.val(v1 + str + v2);
        return (v1 + str).length; //返回最新输入位置
    }

    //function _htmlEscape(text){
    //    return text.replace(/[<>"&]/g, function(match, pos, originalText){
    //        switch(match){
    //            case "<": return "&lt;";
    //            case ">":return "&gt;";
    //            case "&":return "&amp;";
    //            case "\"":return "&quot;";
    //            case "\'": return "&apos;";
    //        }
    //    });
    //}

    //比较两个日期相差天数
    function _dateDiff(new_date, old_date) {
        var subtime = (new Date(new_date) - new Date(old_date)) / 1000;    //计算时间差,并将毫秒转化为秒
        var days = parseInt(subtime / 86400);  //天  24*60*60*1000
        var hours = parseInt(subtime / 3600) - 24 * days;   //小时  60*60  总小时数-过去小时数=现在小时数
        var mins = parseInt(subtime % 3600 / 60);    //分钟 - (day*24)  以60秒为一整份  取余 剩下秒数 秒数/60就是分钟数
        var secs = parseInt(subtime % 60);   //以60秒为一整份  取余  剩下秒数
        if (days > 0) {
            return days + "天"
        }
        if (hours > 0) {
            return hours + "小时"
        }

        if (mins > 0) {
            return mins + "分钟"
        }

        if (secs > 0) {
            return secs + "秒"
        }
        return '';
    }

    //比较两个日期相差天数
    function _dateDiff2(old_date) {
        var subtime = (window.req_nowTime - new Date(old_date)) / 1000;    //计算时间差,并将毫秒转化为秒
        var days = parseInt(subtime / 86400);  //天  24*60*60*1000
        var hours = parseInt(subtime / 3600) - 24 * days;   //小时  60*60  总小时数-过去小时数=现在小时数
        var mins = parseInt(subtime % 3600 / 60);    //分钟 - (day*24)  以60秒为一整份  取余 剩下秒数 秒数/60就是分钟数
        var secs = parseInt(subtime % 60);   //以60秒为一整份  取余  剩下秒数
        if (days > 0) {
            return days + "天"
        }
        if (hours > 0) {
            return hours + "小时"
        }

        if (mins > 0) {
            return mins + "分钟"
        }

        if (secs > 0) {
            return secs + "秒"
        }
        return '1秒';
    }

    /**
     * 格式化金额
     * @param {*} money 
     * @returns 
     */
    function _formatMoney(money) {
        if (money && money - 0 > 0) {
            if (money - 0 < 1000) {
                return money;
            }
            if (money - 0 < 10000) {
                return ((money - 0) / 1000).toFixed(1) + "K";
            }
            return ((money - 0) / 10000).toFixed(1) + "W";
        } else {
            return 0;
        }
    }
    // 会员等级
    const leve_list = [
        {
            l: '新会员',
            v: '0'
        },
        {
            l: '忠实VIP',
            v: '1'
        },
        {
            l: '星级VIP',
            v: '2'
        },
        {
            l: '黄金VIP',
            v: '3'
        },
        {
            l: '白金VIP',
            v: '4'
        },
        {
            l: '晶钻VIP',
            v: '5'
        },
        {
            l: '钻石VIP',
            v: '6'
        },
        {
            l: '金钻VIP',
            v: '7'
        },
        {
            l: '黑钻VIP',
            v: '8'
        },
        {
            l: '至尊VIP',
            v: '9'
        }
    ]

    /**
     *  等级
     * @param {*} level 
     * @returns 
     */
    function _leveName(level) {
        if (level - 0 == -1) {
            return '无'
        }
        const item = leve_list.find(item=> item.v - level == 0);
        if(item){
            return item.l;
        }
        return '无'
    }

    function _leveNameList(level) {
        return [].concat(leve_list)
    }

    /**
     * 刷新状态ui
     */
    function _reflashOnlineUI(userId, isOnline) {
        $(".online_status_" + userId).attr('style', "height:10px;width:10px;background:" + (isOnline ? '#57dc2d' : '#f26c4f') + ";border-radius: 50%;")
        $(".other-tip-" + userId).each(function (i, v) {
            const noPayDate = $(v).attr('noPayDate');
            const level = $(v).attr('level');
            const lastLoginTime = $(v).attr('lastlogintime');
            const cmoney = $(v).attr('cmoney');
            $(v).empty();
            var level_html = ""
            var haveV = false;

            if (noPayDate && noPayDate.length > 0) {
                level_html = level_html + "<span><font color='red'>" + _dateDiff2(noPayDate) + "</font></span>"
                haveV = true;
            }

            if (level && level.length > 0 && level - 0 > -1) {
                level_html = level_html + " <span><font color='black'>" + _leveName(level) + "</font></span>"
                haveV = true;
            }

            if (cmoney && cmoney.length > 0) {
                level_html = level_html + " <span><font color='black'>" + _formatMoney(cmoney) + "</font></span>"
                haveV = true;
            }

            if (lastLoginTime && lastLoginTime.length > 0 && !isOnline) {
                level_html = level_html + " <span>" + _dateDiff2(lastLoginTime) + '前</span>'
                haveV = true;
            }

            if (!haveV && isOnline) {
                level_html = level_html + " <span><font color='#57dc2d'>在线</font></span>"
                haveV = true;
            }
            level_html += " <img class='smallWindow-swtich' src='/images/smallWindow.png' />"
            $(v).append(level_html)
            const chatId = "alarms_li_4_" + userId
            $(`#${chatId} .smallWindow-swtich`).click(function(e) {
                e.stopPropagation();
                RBChatSmallWindowUI.showWindow(userId, '4')
            })
        })
    }

    let onLineTimer = null;


    /**
     * 下线定时器计算
     */
    function _un_line_timer(nowTime) {
        // 缓存用户上次在线id
        if (!window._onlineObj) {
            window._onlineObj = {}         
        }
        var uid = LocalUserInfo.getUid()+'';
        if (!_isMobile() && '401462' != uid) {
            if (onLineTimer) {
                clearInterval(onLineTimer);
                onLineTimer = null;
            }
            window.req_nowTime = new Date(nowTime);
            // 定时器开启
            setInterval(function () {
                // 自动增加1分钟
                const d = window.req_nowTime;
                d.setSeconds(d.getSeconds() + 60);
                window.req_nowTime = d;

                // 遍历好友
                if (window.friends_group_list && window.friends_group_list.length > 0) {
                    window.friends_group_list.forEach(item => {
                        item.list.forEach(item_ => {
                            // 不在线用户，刷新离线时间
                            /* if (!item_.online) {
                                _reflashOnlineUI(item_.user_uid, false)
                            } */
                        //    console.log(item);
                           
                            var online = item_.isOnline == 1 || item_.onlineWeb == 1
                            // console.log(item_.nickname, online);
                            // 判断当前用户最新状态与上次比较，如果一致，无须更新UI
                            if (window._onlineObj[item_.user_uid] != undefined && window._onlineObj[item_.user_uid] == online) {
                                return
                            }
                            // 缓存该用户最新状态
                            window._onlineObj[item_.user_uid] = online
                            if (!online) {
                                // 在浏览器空闲时执行
                                if (typeof requestIdleCallback === 'function') {
                                    requestIdleCallback(() => {
                                        _reflashOnlineUI(item_.user_uid, false)
                                    });
                                  } else {
                                    setTimeout(() => {
                                        _reflashOnlineUI(item_.user_uid, false)
                                    }, 0);
                                  }
                            }

                        })
                    })
                }

            }, 60 * 1000)
        }
    }

    /**
     * 翻译小程序
     * @param {*} content 
     */
    function  _translate_minapp(content,isClick=true){
        if (content && content.length > 0) {
            if(window.app_applets && window.app_applets.length > 0){
                window.app_applets.forEach(item=>{
                    const flag = 'minapp:'+item.appletId
                    const position = content.indexOf(flag)
                    if(position !=-1){
                        content = content.replace(new RegExp(flag, 'g'), isClick ?"<a onclick=\"javascript:minappJump(\'" + item.appletUrl + "\',\'" + item.appletId + "\')\">["+item.appletName+'-小程序]</a>':'['+item.appletName+'-小程序]')
                    }
                })
            }
        }
        return content;
    }

    async function getCityByIP(ip) {
        let response
        try {
            response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`)
        } catch (err) {
            return '未知'
        }
        const data = await response.json();
        return provinceMap[data.region?.toLowerCase()] || '未知'
    }

    function sortChatList(data) {
        if (!data?.length) return
        var localUserUid = LocalUserInfo.getUid();
        data.sort((a, b) => {
            const flag = `${a[8] == 2 ? 9 : a[7] == 1 ? 4 : 8}_${a[0]}_${localUserUid}`
            const flag2 = `${b[8] == 2 ? 9 : b[7] == 1 ? 4 : 8}_${b[0]}_${localUserUid}`
            const is2Top =  RBChatUtils.isKeyVal('2topStr', flag)
            const is2Top2 =  RBChatUtils.isKeyVal('2topStr', flag2)
            if (is2Top === is2Top2) {
                // 如果置顶标记相同，则按时间戳倒序排序
                return b[5] - a[5];
            }
            // 将置顶的项放在最上面
            return is2Top ? -1 : 1;
        });
    }

    // 获取当前用户是否拥有禁言、踢人权限
    function getOpAdmin() {
        const localUser = LocalUserInfo.getObj();
        return window._GROUP_BAN_ADMIN_UIDS.includes(localUser.user_uid) || window._GROUP_BAN_ADMIN_OPEN == '0'
    }

    // 将数组拆分
    function chunkArray(arr, chunkSize = 300) {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }

    // 替换一段链接的主域名， 反馈链接用
    function replaceDomain(url, newDomain) {
        if (!newDomain) return url; // newDomain 不存在，返回原来的
      
        try {
          const u = new URL(url);
          u.host = newDomain.trim(); // 替换主域名
          return u.toString();
        } catch (err) {
          console.error("URL 格式错误:", err);
          return url;
        }
      }

    // 解析看片小程序数据
    function parseVideoMiniApp(str) {
        // 1. 先分离出前缀（code 部分）和链接
        const match = str.match(/^\[视频小程序\](.*?)\s*,\s*(https?.+)$/);
        if (!match) return null;

        const title = match[1].trim();
        const fullUrl = match[2].trim();

        // 2. 解析 URL 里的 cover 参数
        const urlObj = new URL(fullUrl);
        const cover = urlObj.searchParams.get("cover");

        return {
            title,
            fullUrl,
            cover
        };
    }

    // 工具类对象！
    var utils = {
        translate_minapp:_translate_minapp,
        leveNameList: _leveNameList,
        draw_mul_pic:_draw_mul_pic,
        dateDiff2: _dateDiff2,
        reflashOnlineUI: _reflashOnlineUI,
        un_line_timer: _un_line_timer,
        formatMoney: _formatMoney,
        leveName: _leveName,
        dateDiff: _dateDiff,
        isString: _isString,
        isStringEmpty: _isStringEmpty,
        trim: _trim,
        device: _device,
        playAudio: _playAudio,
        getBrowserInfo: _getBrowserInfo,
        formatDate: _formatDate,
        parseDate: _parseDate,
        log: _log,
        logToConsole: _logToConsole,
        logToConsole_INFO: _logToConsole_INFO,
        logToConsole_DEBUG: _logToConsole_DEBUG,
        logToConsole_WARN: _logToConsole_WARN,
        logToConsole_ERROR: _logToConsole_ERROR,
        stringIsEmail: _stringIsEmail,
        stringIsInt: _stringIsInt,
        saveAuthedLocalUserInfoToCookie: _saveAuthedLocalUserInfoToCookie,
        getAuthedLocalUserInfoFromCookie: _getAuthedLocalUserInfoFromCookie,
        setMsgToneOpenToCookie: _setMsgToneOpenToCookie,
        isMsgToneOpenFromCookie: _isMsgToneOpenFromCookie,
        utcTimestampToStringWithPattern: _utcTimestampToStringWithPattern,
        utcTimestampToString: _utcTimestampToString,
        getUserAvatarDownloadURL: _getUserAvatarDownloadURL,
        getUserAvatarDownloadURL2: _getUserAvatarDownloadURL2,
        getGroupAvatarDownloadURL: _getGroupAvatarDownloadURL,
        getBgColor: _getBgColor,
        getGroupAvatarDownloadURL2: _getGroupAvatarDownloadURL2,
        getImageDownloadURL: _getImageDownloadURL,
        getVoiceDownloadURL: _getVoiceDownloadURL,
        uploadFile: _uploadFile,
        getBigFileDownloadURL: _getBigFileDownloadURL,
        getShortVideoDownloadURL: _getShortVideoDownloadURL,
        getShortVideoThumbDownloadURL: _getShortVideoThumbDownloadURL,
        getLocationPreviewImgDownloadURL: _getLocationPreviewImgDownloadURL,
        getPhotoDownloadURL: _getPhotoDownloadURL,
        getPVoiceDownloadURL: _getPVoiceDownloadURL,
        getCurrentUTCTimestamp: _getCurrentUTCTimestamp,
        getMMSSFromSS: _getMMSSFromSS,
        getTimeStringAutoShort: _getTimeStringAutoShort2,
        showIFrameURL: _showIFrameURL,
        isMobile: _isMobile,
        showFirstPageMinApp: _showFirstPageMinApp,
        isTipMy: _isTipMy,
        showChatDetail: _showChatDetail,
        getTimeHH24Human: _getTimeHH24Human,
        getTimeSegmentStr: _getTimeSegmentStr,
        setTextFocus: _setTextFocus,
        getConvenientFileSize: _getConvenientFileSize,
        updateGroupAvatar: _updateGroupAvatar,
        getFileExtName: _getFileExtName,
        setKeyVal: _setKeyVal,
        cancleKeyVal: _cancleKeyVal,
        isKeyVal: _isKeyVal,
        getDurationFromVoiceFileName: _getDurationFromVoiceFileName,
        beautySubstring: _beautySubstring,
        replacePlaceholderForAlarmsItemContent: _replacePlaceholderForAlarmsItemContent,
        copyText: _copyText,
        getNickNameWithRemark: _getNickNameWithRemark,
        getCursorPos: _getCursorPos,
        setCursorPos: _setCursorPos,
        insertAtCursor: _insertAtCursor,
        imgListSwiper: _fimgList,
        fvideo: _fvideo,
        //htmlEscape                           : _htmlEscape
        copyToClipboard: _copyToClipboard,
        getCityByIP,
        sortChatList,
        getOpAdmin,
        chunkArray,
        replaceDomain,
        parseVideoMiniApp,
        decImage
    };

    window.RBChatUtils = utils;
})();


// NotificationPromptHelper 对象
(function () {

    /**
     * 收到了加好友请求时的提示（由服务端通知被请求者）.
     *
     * @param {String} srcUserNickName 昵称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showAddFriendRequestNotivication(srcUserNickName, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert('收到' + srcUserNickName + '的加好友请求...', true);
    }

    /**
     * 服务端反馈给请求发起者，加好友请求在服务端处理中出现的各种错误时的提示（由服务端通知请求发起者）.
     *
     * @param {String} errorMsg 错误消息
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showAddFriendRequest_RESPONSE$FOR$ERROR_SERVER$TO$ANotivication(errorMsg, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert(errorMsg, true);
    }

    /**
     * 新添加的好友成列加入到好友列表了（由服务端通知请求发起者和
     * 被请求者：被加者同意后服务端会同时向请求者和被加者送出成功指令）.
     *
     * @param {String} newFriendNickName 昵称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showNewFriendAddSucessNotivication(newFriendNickName, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert('您已成功添加' + newFriendNickName + '为好友', true);
    }

    /**
     * "我"被邀请进入了群聊的系统通知.
     *
     * @param {String} groupName 群名称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showMyselfBeInvitedGroupNotivication(groupName, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert('您已加入群组\"' + groupName + '\"', true);
    }

    /**
     * 加好友被拒绝时的提示（由服务端提示加好友发起人A）.
     *
     * @param {String} userNickName 昵称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showAddFriendBeRejectNotivication(userNickName, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert(userNickName + '拒绝了你的加好友请求', false);
    }

    /**
     * 相关处理界面处于后台时接收到音视频聊天请求时的提示（来自发起人A）. -- AnyChat
     *
     * @param {String} friendNickName 昵称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showVoiceAndVideoRequestNotivication(friendNickName, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert(friendNickName + '向您发起了视频聊天请求，但本客户端当前不支持实时音视频聊天！', false);
    }

    /**
     * 相关处理界面处于后台时接收到好友发过来的聊天消息时的提示（来自发起人A）.
     *
     * @param {String} friendNickName 昵称
     * @param {String} message 内容
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showRecievedFriendMessageNotivication(friendNickName, message, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert(friendNickName + ' 说: ' + message, true)
    }

    /**
     * 收到一个临时聊天消息哦.
     * <p>目前此Notivication里只处理了“普通文本消息”哦！
     *
     * @param {int} msgType 消息类型
     * @param {String} msg 消息内容，纯文本字串，可能是聊天文字、图片文件名或语音文件名等，但一定不是JSON字串
     * @param {String} fromNickName 昵称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showATempChatMsgNotivication(msgType, msg, fromNickName, ui_fn_showIMPanelAlert) {
        var messageContentForShow = MessageHelper.parseMessageForShow(msg, msgType);
        ui_fn_showIMPanelAlert(fromNickName + ' 说:' + messageContentForShow, true);
    }

    /**
     * 收到一个群聊天消息哦.
     *
     * @param {boolean} isWordChat
     * @param {int} msgType 消息类型
     * @param {String} msg 消息内容
     * @param {String} fromNickName
     * @param {String} toGname
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showAGroupChatMsgNotivication(isWordChat, msgType, msg, fromNickName, toGname, ui_fn_showIMPanelAlert) {
        var messageContentForShow = MessageHelper.parseMessageForShow(msg, msgType);
        ui_fn_showIMPanelAlert((isWordChat ? '[世界频道]' : '[群聊消息](' + toGname + ')') + fromNickName + ' 说：' + messageContentForShow);
    }

    /**
     * 【收到实时语音请求处理方式3】相关处理界面处于后台时接收实时语音聊天请求时的提示（来自发起人A）.
     *
     * @param {String} friendNickName 昵称
     * @param {function} ui_fn_showIMPanelAlert 回调函数
     */
    function _showRealTimeVoiceRequestNotivication(friendNickName, ui_fn_showIMPanelAlert) {
        ui_fn_showIMPanelAlert(friendNickName + '向您发起了实时语音聊天请求，但本客户端当前不支持实时音视频聊天！', false);
    }


    var promptHelper = {
        showAddFriendRequestNotivication: _showAddFriendRequestNotivication,
        showAddFriendRequest_RESPONSE$FOR$ERROR_SERVER$TO$ANotivication: _showAddFriendRequest_RESPONSE$FOR$ERROR_SERVER$TO$ANotivication,
        showNewFriendAddSucessNotivication: _showNewFriendAddSucessNotivication,
        showMyselfBeInvitedGroupNotivication: _showMyselfBeInvitedGroupNotivication,
        showAddFriendBeRejectNotivication: _showAddFriendBeRejectNotivication,
        showVoiceAndVideoRequestNotivication: _showVoiceAndVideoRequestNotivication,
        showRecievedFriendMessageNotivication: _showRecievedFriendMessageNotivication,
        showATempChatMsgNotivication: _showATempChatMsgNotivication,
        showAGroupChatMsgNotivication: _showAGroupChatMsgNotivication,
        showRealTimeVoiceRequestNotivication: _showRealTimeVoiceRequestNotivication
    };

    window.NotificationPromptHelper = promptHelper;

})();



// AudioPromptHelper 对象：用于声音提示的辅助类
(function () {

    var AUDIO_BASE_URL = '../../audio/';

    /**
     * 收到新消息时的提示音。
     *
     * @private
     */
    function _newMessagePromt() {
        var localUserUid = LocalUserInfo.getUid();
        if (RBChatUtils.isMsgToneOpenFromCookie()) {
            const voice = localStorage.getItem(`${localUserUid}_voice`) || 'audio_msg.mp3'
            RBChatUtils.playAudio(AUDIO_BASE_URL + voice)
        }
    }

    function _voicePlayendPromt() {
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_playend.mp3")
    }

    /**
     * 播放好友添加成功后的提示音.
     */
    function _newFriendAddSucessPromt() {
        var localUserUid = LocalUserInfo.getUid();
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_new_friend_add_sucess.mp3")
    }

    /**
     * 文件、消息发送成功提示音。
     *
     * @private
     */
    function _fileSentPromt() {
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_voice_send.mp3")
    }

    /**
     * 失败提示音。
     *
     * @private
     */
    function _msgSentFailPromt() {
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_fail_prompt.mp3")
    }

    /**
     * 显示提示信息对话框时的提示音。
     *
     * @private
     */
    function _alertPromt() {
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_alert.mp3")
    }

    /**
     * 显示用户确认对话框时的提示音。
     *
     * @private
     */
    function _confirmPromt() {
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_confirm.mp3")
    }

    /**
     * 真人语音“提醒”提示音。
     *
     * @private
     */
    function _humanTixingPromt() {
        if (RBChatUtils.isMsgToneOpenFromCookie())
            RBChatUtils.playAudio(AUDIO_BASE_URL + "audio_human_tixing.mp3")
    }

    var audioPromptHelper = {
        newMessagePromt: _newMessagePromt,//
        voicePlayendPromt: _voicePlayendPromt,
        newFriendAddSucessPromt: _newFriendAddSucessPromt,//
        fileSentPromt: _fileSentPromt,//
        msgSentFailPromt: _msgSentFailPromt,//
        alertPromt: _alertPromt,//
        confirmPromt: _confirmPromt,//
        humanTixingPromt: _humanTixingPromt//
    };

    window.AudioPromptHelper = audioPromptHelper;

})();


