const axios = require('axios');
const fs = require('fs');
process.stdin.setEncoding('utf8');
const config = require('./config.json');

let turboTime = Date.now();

async function checkProxy(proxyString) {
    const url = "http://api.myip.com/";
    const headers = {
    };

    // Proxy details
    const [host, port, username, password] = proxyString.split(':');


    const proxy = {
        host: host,
        port: parseInt(port),
        auth: {
            username: username,
            password: password
        }
    };

    try {
        const response = await axios.get(url, { headers, proxy });
        return response.data
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu:", error);
    }
}

async function getAccessTokenAndShares(initDataLine, proxy) {
    const [cacheId, chrValue, actualInitData] = initDataLine.split('|');
    const url = "http://api.tapswap.ai/api/account/login";
    const headers = {
        "accept": "*/*",
        "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "cache-id": cacheId,
        "content-type": "application/json",
        "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-app": "tapswap_server",
        "x-cv": "629",
        "Referer": "https://app.tapswap.club/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const _proxy = await axios.get("http://api.myip.com/", { headers, proxy });


    const payload = {
        "init_data": actualInitData,
        "referrer": "",
        "chr": parseInt(chrValue),
        "bot_key": "app_bot_1"
    };

    try {
        const response = await axios.post(url, data = payload, { headers: headers, proxy });
        if (response.status === 201) {
            const data = response.data;
            if (data.access_token) {
                const accessToken = data.access_token;
                const name = data.player.full_name;
                const coin = data.player.shares;
                const energy = data.player.energy;
                const levelEnergy = data.player.energy_level;
                const levelCharge = data.player.charge_level;
                const levelTap = data.player.tap_level;
                const boosts = data.player.boost;
                const energyBoost = boosts.find(b => b.type === "energy") || {};
                const turboBoost = boosts.find(b => b.type === "turbo") || {};
                const boostReady = turboBoost.cnt;
                const energyReady = energyBoost.cnt;
                // const energyLevelArray = data.conf.energy_levels;

                console.log(`\n========================== `);
                console.log(`\x1b[32m[PROXY USING]: \x1b[31m ${_proxy.data.ip} LOCATION: ${_proxy.data.country}`)
                console.log(`\x1b[32m[Tên]: \x1b[33m${name}`);
                console.log(`\x1b[32m[Coin]: \x1b[34m${coin}`);
                console.log(`\x1b[32m[Enegry]: \x1b[36m${energy}`);
                console.log(`\x1b[32m[Level Tap]: \x1b[33m${levelTap}`);
                console.log(`\x1b[32m[Level Enegry]: \x1b[35m${levelEnergy}`);
                console.log(`\x1b[32m[Level Recharge]: \x1b[35m${levelCharge}`);
                console.log(`\x1b[32m[Free Booster] : \x1b[20mEnergy ${energyBoost.cnt} | Turbo : ${turboBoost.cnt}`);

                return { accessToken, energy, boostReady, energyReady, levelCharge };
            } else {
                console.log("Không thể lấy token")
                return { accessToken: null, energy: null, boostReady: null, energyReady: null, };
            }
        } else if (response.status === 408) {
            console.log("Request Time Out");
        } else {
            console.log(`Lỗi khi lấy token.`);
        }
    } catch (error) {
        console.error(`\rLỗi gì đó: ${error}`);
        return { accessToken: null, energy: null, boostReady: null, energyReady: null, code: 9 };
    }

    return { accessToken: null, energy: null, boostReady: null, energyReady: null };
}

async function claimReward(accessToken, proxy) {
    const url = "http://api.tapswap.ai/api/player/claim_reward";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-cv": "608",
        "x-bot": "no",
    };
    console.log(`\x1b[35m\x1b[1mĐang Tiến Hành Claim.... \x1b[0m`);
    const task = [
        "L1",
        "L2",
        "L3",
        "L4",
        "L5",
        "L6",
        "L7",
        "L8",
        "L9",
        "L10",
    ]
    for (let i = 0; i < task.length; i++) {
        const payload = { "task_id": task[i] };
        try {

            // if claim not success, stop for loop
            const response = await axios.post(url, payload, { headers, proxy });
            if (response.status === 201) {
                console.log(`\x1b[32m\x1b[1mHoàn thành nhiệm vụ ${task[i]}\x1b[0m`);
            } else {
                console.log(`\x1b[31m\x1b[1mKhông thể hoàn thành nhiệm vụ ${task[i]}, mã trạng thái: ${response.status}\x1b[0m`);

            }
        } catch (error) {
            // console.error(`\x1b[31m\x1b[1mKhông thể hoàn thành nhiệm vụ ${task[i]}\x1b[0m`);
        }
    }

}



async function applyTurboBoost(accessToken, turboActivated, proxy) {
    const url = "http://api.tapswap.ai/api/player/apply_boost";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-cv": "608",
        "x-bot": "no",
    };

    const payload = { "type": "turbo" };


    if (!turboActivated) {
        try {
            const response = await axios.post(url, payload, { headers: headers, proxy });

            if (response.status === 201) {
                console.log(`Turbo boost đã được kích hoạt`);
                return true;
            } else {
                console.log(`Không thể kích hoạt turbo boost, mã trạng thái: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error(`Không thể kích hoạt turbo boost: ${error}`);
            return false;
        }
    } else {
        console.log(`Turbo đã được kích hoạt`);
        return false;
    }
}


async function applyEnergyBoost(access_token, proxy) {
    const url = "http://api.tapswap.ai/api/player/apply_boost";
    const headers = {
        "Authorization": `Bearer ${access_token}`,
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-cv": "608",
        "x-bot": "no",
    };

    const payload = { "type": "energy" };

    try {
        const response = await axios.post(url, payload, { headers, proxy });
        if (response.status === 201) {
            console.log("Boost năng lượng đã được kích hoạt thành công");
            // Gọi hàm submit_taps() nếu cần
            //   submit_taps(access_token, 100, 0, 0, content_id, time_stamp, init_data_line);
            return true;
        } else {
            console.log(`Không thể kích hoạt boost năng lượng, mã trạng thái: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu:", error);
        return false;
    }
}



async function upgradeLevel(headers, upgrade_type, proxy) {

    for (let i = 0; i < 3; i++) {
        process.stdout.write(`\r\x1b[37m\x1b[1mUpgrading ${upgrade_type} ${'.'.repeat(i % 4)}\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, 333)); // Delay 1 second
    }

    const url = "http://api.tapswap.ai/api/player/upgrade";
    const payload = { "type": upgrade_type };

    try {
        const response = await axios.post(url, payload, { headers, proxy });
        if (response.status === 201) {
            console.log("\r\x1b[32m\x1b[1mUpgrade " + upgrade_type + " Succesfully\x1b[0m");
            if (response.data.player.charge_level < 3) {
                await upgradeLevel(headers, "charge", proxy);
            }
            return true;
        } else {
            const errorMessage = response.data.message;
            if (errorMessage && errorMessage.includes("not_enough_shares")) {
                console.log("\r\x1b[31m\x1b[1mCoin không đủ để nâng cấp " + upgrade_type + "\x1b[0m");
            } else {
                console.log("\r\x1b[31m\x1b[1mLỗi khi nâng cấp " + upgrade_type + ": " + errorMessage + "\x1b[0m");
            }
            return false;
        }
    } catch (error) {
        console.error("\r\x1b[31m\x1b[1mLỗi khi gửi yêu cầu nâng cấp " + upgrade_type + ":\x1b[0m", error);
        return false;
    }
}

async function joinMission(accessToken, missionId, proxy) {
    const url = "http://api.tapswap.ai/api/missions/join_mission";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": `Bearer ${accessToken}`,
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-bot": "no",
        "x-cv": "608",
    }
    const payload = { "id": missionId };
    try {
        const response = await axios.post(url, payload, { headers, proxy });
        if (response.status === 201) {
            console.log(`[KYC] Tham gia nhiệm vụ thành công : ${missionId}`);
            return true;
        } else {
            console.log("Không thể tham gia nhiệm vụ, mã trạng thái: " + response.status);
            return false;
        }
    } catch (error) {
        if( error.response.data.message == "mission_already_completed") {
            console.log(`\x1b[33m\x1b[1 [KYC] Nhiệm vụ đã hoàn thành rồi : ${missionId}`);
            await claimMissionReward(accessToken, missionId, proxy)
            return false
        }
        if (error.response.data.message == "mission_already_joined") {
            console.log(`\x1b[34m\x1b[1[KYC] Nhiệm vụ đang tham gia rồi : ${missionId}`);
            return true;
        }
        console.error("Lỗi khi gửi yêu cầu:", error);
        return false;
    }
}

async function finishMissionItem(accessToken, missionId, itemIndex, userInput = null, proxy) {
    const url = "http://api.tapswap.ai/api/missions/finish_mission";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": `Bearer ${accessToken}`,
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-bot": "no",
        "x-cv": "608",
    }
    const payload = { "id": missionId, "itemIndex": itemIndex };
    if (userInput) {
        payload.userInput = userInput;
    }
    try {
        const response = await axios.post(url, payload, { headers, proxy });
        if (response.status === 201) {
            console.log("\x1b[35m\x1b[1Hoàn thành nhiệm vụ thành công");
            return true;
        } else {
            console.log("\x1b[32m\x1b[1Không thể hoàn thành nhiệm vụ finishMissionItem, mã trạng thái: " + response.status);
            return false;
        }
    } catch (error) {
        if(error.response.data.message == "mission_not_found") {   
            console.log(`\x1b[32m\x1b[1[KYC] Không tìm thấy NV : ${missionId}`);
            return true;
        }
        if(error.response.data.message == "mission_item_already_verified") {
            console.log(`\x1b[32m\x1b[1[KYC] NV đã hoàn thành : ${missionId}`);
            return true;
        }
        if(error.response.data.message == "mission_items_not_finished") {
            console.log(`\x1b[32m\x1b[1[KYC] NV chưa hoàn thành, thử lại sau : ${missionId}`);
            return false;
        }
        console.error("\x1b[32m\x1b[1Lỗi khi gửi yêu cầu finishMissionItem :", error);
        return false;
    }
}

async function finishMission(accessToken, missionId, proxy) {
    const url = "http://api.tapswap.ai/api/missions/finish_mission";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": `Bearer ${accessToken}`,
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-bot": "no",
        "x-cv": "608",
    }
    const payload = { "id": missionId };
    try {
        const response = await axios.post(url, payload, { headers, proxy });
        if (response.status === 201) {
            console.log("\x1b[35m\x1b[1Hoàn thành nhiệm vụ thành công");
            return true;
        } else {
            console.log("\x1b[32m\x1b[1Không thể hoàn thành nhiệm vụ finishMission, mã trạng thái: " + response.status);
            return false;
        }
    } catch (error) {
        if(error.response.data.message == "mission_items_not_finished") {
            console.log(`\x1b[32m\x1b[1[KYC] NV chưa hoàn thành, thử lại sau : ${missionId}`);
            return false;
        }
        console.error("Lỗi khi gửi yêu cầu finishMission :", error);
        return false;
    }
}

async function claimMissionReward(accessToken, missionId, proxy) {
    const url = "http://api.tapswap.ai/api/player/claim_reward";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": `Bearer ${accessToken}`,
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-bot": "no",
        "x-cv": "608",
    }
    const payload = { "task_id": missionId };

    try {
        const response = await axios.post(url, payload, { headers, proxy });
        if (response.status === 201) {
            console.log("Nhận thưởng thành công 3 Củ khoai");
            return true;
        } else {
            console.log("Không thể nhận thưởng, mã trạng thái: " + response.status);
            return false;
        }
    }
    catch (error) {
        if(error.response.data.message == "player_claim_not_found") {
            console.log(`[KYC] Không thể nhận thưởng : ${missionId}`);
            return false;
        }
        console.error("Lỗi khi gửi yêu cầu claimMissionReward:", error);
        return false;
    }
}


async function AutoBinanceKYC(accessToken, missionId, binanceId, proxy) {
    console.log(`\x1b[35m\x1b[1mĐang Tiến Hành KYC Binance.... \x1b[0m`);
    const joinMissionCheck = await joinMission(accessToken, missionId, proxy);
    if (joinMissionCheck) {
        for (let i = 0; i < 3; i++) {
            if (i == 2) {
                await finishMissionItem(accessToken, missionId, i, binanceId, proxy);
            }
            else {
                await finishMissionItem(accessToken, missionId, i, null, proxy);
            }
        }
        await finishMission(accessToken, missionId, proxy);
        claimMissionReward(accessToken, missionId, proxy);
    }

}

// set current timestamp
async function submitTaps(token, content_id, time_stamp, config, proxy) {
    let isTurbo = false;
    let tempTurboCount = token.boostReady;
    const url = "http://api.tapswap.ai/api/player/submit_taps";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Authorization": `Bearer ${token.accessToken}`,
        "Connection": "keep-alive",
        "Content-Id": parseInt(content_id),
        "Content-Type": "application/json",
        "Origin": "http://app.tapswap.club",
        "Referer": "http://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-bot": "no",
        "x-cv": "608",
    };
    // Chỉnh số lên nếu muốn nâng charge cao hơn
    if (config.upgrade == true) {
        if (token.levelCharge < 3) {
            await upgradeLevel(headers, "charge", proxy);
        }
        else console.log("\x1b[37m\x1b[1mĐã nâng cấp Charge Level 3 rồi\x1b[0m");
    }

    while (true) {

        if (config.booster == true && tempTurboCount > 0) {
            if ((Date.now() - turboTime > 21000 && tempTurboCount > 0) || isTurbo == false) {
                console.log("\x1b[37m\x1b[1mTurbo boost đã sẵn sàng, đang áp dụng turbo boost\x1b[0m");
                const activeTubor = await applyTurboBoost(token.accessToken, false, proxy);
                if (activeTubor) {
                    tempTurboCount = tempTurboCount - 1;
                    turboTime = Date.now();
                    isTurbo = true;
                }
            } else {
                console.log("\x1b[37m\x1b[1mTurbo đã kích hoạt hoặc không thể kích hoạtt\x1b[0m");
            }
        }

        const totalTaps = isTurbo ? 100000 : 10000;
        const payload = { "taps": totalTaps, "time": parseInt(time_stamp) };
        if (isTurbo) {
            let coin = token?.data?.player?.shares || 0;
            while (isTurbo) {
                try {
                    const response = await axios.post(url, payload, { headers, proxy });
                    if (response.status === 201) {
                        coin = response.data.player.shares;
                        console.log("\x1b[32m\x1b[1mĐã nhấn với Tubor Boost\x1b[0m");
                    } else {
                        console.log("\x1b[31m\x1b[1mGửi nhấn thất bại, mã trạng thái: " + response.status + "\x1b[0m");
                    }
                } catch (error) {
                    console.error("\x1b[31m\x1b[1mLỗi khi gửi yêu cầu:\x1b[0m", error);
                }
                if (Date.now() - turboTime > 21000) {
                    console.log("\x1b[37m\x1b[1mTurbo boost đã hết hiệu lực\x1b[0m");
                    console.log("Coin: " + coin);
                    isTurbo = false;
                }
            }
        } else {
            try {
                const response = await axios.post(url, payload, { headers, proxy });
                if (response.status === 201) {
                    console.log("\x1b[32m\x1b[1mĐã nhấn\x1b[0m");
                    console.log(response.data.player.boost);
                    console.log("Coin: " + response.data.player.shares);
                    if (
                        response.data.player.energy < 50 && response.data.player.boost.find(b => b.type === "energy").cnt > 0 && isTurbo == false
                    ) {
                        const rs = await applyEnergyBoost(token.accessToken, proxy);
                        if (rs) {
                            console.log("Boost năng lượng đã được kích hoạt");
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.log("Không đủ năng lượng hoặc không có boost năng lượng");
                        console.log("Coin: " + response.data.player.shares);
                        console.log("\x1b[31m\x1b[1mCHUYỂN ACCOUNT SAU 3S\x1b[0m");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        return { status: "success", code: 5, data: response.data.player.shares }
                    }
                } else {
                    console.log("\x1b[31m\x1b[1mGửi nhấn thất bại, mã trạng thái: " + response.status + "\x1b[0m");
                }
            } catch (error) {
                console.error("\x1b[31m\x1b[1mLỗi khi gửi yêu cầu:\x1b[0m", error);
            }
        }
    }
}


//main
async function main() {
    //read queryId from file
    const authorizations = fs.readFileSync('url.txt', 'utf8').split('\r\n');
    const proxies = fs.readFileSync('proxy.txt', 'utf8').split('\r\n');


    console.log(`\x1b[32m\x1b[1mĐang Tiến Hành Kiểm Tra Proxy ... \x1b[0m`);
    let liveProxy = [];
    for (const iterator of proxies) {
        const rs = await checkProxy(iterator);
        if (rs && rs.ip) {
            liveProxy.push(iterator)
        }
    }
    console.log(`\x1b[32m\x1b[1mKiểm Tra Xong Proxy.... Số Lượng : ${liveProxy.length} \x1b[0m`);
    const min = Math.min(authorizations.length, liveProxy.length)
    for (let i = 0; i < min; i++) {
        let contentId;
        let time_stamp;
        const user_data = authorizations[i].trim(); // Get user data
        const string_3 = user_data.split('|')[2];
        const decodedString = decodeURIComponent(string_3);
        const userParam = decodedString.split('user=')[1].split('&auth_date')[0];
        const userObject = JSON.parse(userParam);
        const userId = userObject.id;

        if (userId) {
            time_stamp = Date.now(); // Get current time in milliseconds
            contentId = ((time_stamp * userId * userId / userId) % userId % userId); // Calculate content ID
            const [host, port, username, password] = liveProxy[i].split(':');
            const proxy = {
                host: host,
                port: parseInt(port),
                auth: {
                    username: username,
                    password: password
                }
            };
            const token = await getAccessTokenAndShares(user_data, proxy);
            if (token.accessToken) {
                const binance_id = String(Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000);
                if (config.kyc == true) {
                    await AutoBinanceKYC(token.accessToken, "M34", binance_id, proxy);
                }
                if ( config.claim == true) {
                    await claimReward(token.accessToken, proxy);
                }
                //wait 3s
                await new Promise(resolve => setTimeout(resolve, 1000));
                // await submitTaps(access_token, energy, boost_ready, energy_ready, contentId, time_stamp, authorization);
                // const tabRs = await taptap(token.accessToken, contentId, time_stamp);
                const claimRs = await submitTaps(token, contentId, time_stamp, config, proxy);
                console.log(claimRs)
                console.log(`\n========================== `);
            }
            else {
                console.log("Không thể lấy token")
                //continue to next account
                continue;
            }
        }

    }

    console.log("\x1b[35m\x1b[1mCHẠY LẠI SAU 300S\x1b[0m");
    await new Promise(resolve => setTimeout(resolve, 300000));
    main();
}
main();