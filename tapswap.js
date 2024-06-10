const axios = require('axios');
const fs = require('fs');
process.stdin.setEncoding('utf8');
const config = require('./config.json');

let turboTime = Date.now();
async function getAccessTokenAndShares(initDataLine) {
    const url = "https://api.tapswap.ai/api/account/login";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "https://app.tapswap.club",
        "Referer": "https://app.tapswap.club/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "x-app": "tapswap_server",
        "x-cv": "621",
        "x-bot": "no",
    };

    const [chrValue, actualInitData] = initDataLine.split('|');
    const payload = {
        "init_data": actualInitData,
        "referrer": "",
        "chr": parseInt(chrValue),
        "bot_key": "app_bot_1"
    };
    try {
        const response = await axios.post(url, payload, { headers: headers });
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
                const energyLevelArray = data.conf.energy_levels;

                console.log(`\n========================== `);
                console.log(`[Tên]: ${name}`);
                console.log(`[Coin]: ${coin}`);
                console.log(`[Enegry]: ${energy}`);
                console.log(`[Level Tap]: ${levelTap}`);
                console.log(`[Level Enegry]: ${levelEnergy}`);
                console.log(`[Level Recharge]: ${levelCharge}`);
                console.log(`[Free Booster] : Energy ${energyBoost.cnt} | Turbo : ${turboBoost.cnt}`);

                return { accessToken, energy, boostReady, energyReady, energyLevelArray };
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
        return { accessToken: null, energy: null, boostReady: null, energyReady: null };
    }

    return { accessToken: null, energy: null, boostReady: null, energyReady: null };
}

async function claimReward(accessToken) {
    const url = "https://api.tapswap.ai/api/player/claim_reward";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "https://app.tapswap.club",
        "Referer": "https://app.tapswap.club/",
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
            const response = await axios.post(url, payload, { headers });
            if (response.status === 201) {
                console.log(`\x1b[32m\x1b[1mHoàn thành nhiệm vụ ${task[i]}\x1b[0m`);
            } else {
                console.log(`\x1b[31m\x1b[1mKhông thể hoàn thành nhiệm vụ ${task[i]}, mã trạng thái: ${response.status}\x1b[0m`);

            }
        } catch (error) {
            console.error(`\x1b[31m\x1b[1mKhông thể hoàn thành nhiệm vụ ${task[i]}\x1b[0m`);
        }
    }

}


async function taptap(accessToken, contentId, time_stamp) {
    const url = "https://api.tapswap.ai/api/player/submit_taps";
    const headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "authorization": `Bearer ${accessToken}`,
        "content-id": contentId,
        "content-type": "application/json",
        "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-app": "tapswap_server",
        "x-bot": "no",
        "x-cv": "622",
        "Referer": "https://app.tapswap.club/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const data = {
        taps: 10,
        time: parseInt(time_stamp)
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log(response.data);
        
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu:", error);
    }
}


async function applyTurboBoost(accessToken, turboActivated) {
    const url = "https://api.tapswap.ai/api/player/apply_boost";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "https://app.tapswap.club",
        "Referer": "https://app.tapswap.club/",
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
            const response = await axios.post(url, payload, { headers: headers });

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


async function applyEnergyBoost(access_token) {
    const url = "https://api.tapswap.ai/api/player/apply_boost";
    const headers = {
        "Authorization": `Bearer ${access_token}`,
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Origin": "https://app.tapswap.club",
        "Referer": "https://app.tapswap.club/",
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
        const response = await axios.post(url, payload, { headers });
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

async function upgradeLevel(headers, upgrade_type) {

    for (let i = 0; i < 5; i++) {
        process.stdout.write(`\r\x1b[37m\x1b[1mUpgrading ${upgrade_type} ${'.'.repeat(i % 4)}\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 second
    }

    const url = "https://api.tapswap.ai/api/player/upgrade";
    const payload = { "type": upgrade_type };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 201) {
            console.log("\r\x1b[32m\x1b[1mUpgrade " + upgrade_type + " berhasil\x1b[0m");
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
// set current timestamp
async function submitTaps(token, content_id, time_stamp, config ) {
    while (true) {
        let isTurbo = false;
        const url = "https://api.tapswap.ai/api/player/submit_taps";
        if(config.booster == true && token.boostReady > 0){
            if (token.boostReady > 0) {
                if (Date.now() - turboTime > 25000) {
                    console.log("\x1b[37m\x1b[1mTurbo boost đã sẵn sàng, đang áp dụng turbo boost\x1b[0m");
                    const activeTubor = await applyTurboBoost(token.accessToken, false);
                    if (activeTubor) {
                        turboTime = Date.now();
                        isTurbo = true;
                    }
                } else {
                    console.log("\x1b[37m\x1b[1mTurbo đã kích hoạt\x1b[0m");
                }
            }
        }
        // if (use_booster == true) {
        //     if (boost_ready > 0) {
        //         //25s
        //         if (Date.now() - turboTime > 25000) {
        //             console.log("\x1b[37m\x1b[1mTurbo boost đã sẵn sàng, đang áp dụng turbo boost\x1b[0m");
        //             const activeTubor = await applyTurboBoost(token.accessToken, false);
        //             if (activeTubor) {
        //                 turboTime = Date.now();
        //             }
        //         } else {
        //             console.log("\x1b[37m\x1b[1mTurbo đã kích hoạt\x1b[0m");
        //         }
        //     }
        // }

        // if (energy < 50) {
        //     console.log("\x1b[31m\x1b[1mNăng lượng thấp\x1b[0m");
        //     if (use_booster == true) {
        //         if (Date.now() - turboTime > 25000) {
        //             if (energy_ready > 0) {
        //                 console.log("\x1b[37m\x1b[1mEnergy boost đã sẵn sàng, đang áp dụng energy boost\x1b[0m");
        //                 const rs = await applyEnergyBoost(access_token);
        //                 // cekEnergy = 100;
        //             }
        //         }
        //     } else {
        //         await new Promise(resolve => setTimeout(resolve, 3000));
        //         console.log("\x1b[31m\x1b[1mChuyển sang tài khoản tiếp theo\x1b[0m");
        //         return;
        //         access_token, energy, boost_ready = getAccessTokenAndShares(init_data_line);
        //     }
        // } else {
        //     console.log("\x1b[37m\x1b[1mĐang nhấn ...\x1b[0m");
        // }

        const headers = {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Authorization": `Bearer ${token.accessToken}`,
            "Connection": "keep-alive",
            "Content-Id": parseInt(content_id),
            "Content-Type": "application/json",
            "Origin": "https://app.tapswap.club",
            "Referer": "https://app.tapswap.club/",
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
        const totalTaps = isTurbo ? 100000 : 10000;
        const payload = { "taps": totalTaps, "time": parseInt(time_stamp) };
            if (isTurbo) {
                for (let i = 0; i < 20; i++) {
                    process.stdout.write(`\r\x1b[37m\x1b[1mTapping Turbo${'.'.repeat(i % 4)}\x1b[0m`);
                    try {
                        const response = await axios.post(url, payload, { headers });
                        if (response.status === 201) {
                            console.log("\x1b[32m\x1b[1mĐã nhấn\x1b[0m");
                        } else {
                            console.log("\x1b[31m\x1b[1mGửi nhấn thất bại, mã trạng thái: " + response.status + "\x1b[0m");
                        }
                    } catch (error) {
                        console.error("\x1b[31m\x1b[1mLỗi khi gửi yêu cầu:\x1b[0m", error);
                    }
                    if (turboTime < Date.now()) {
                        isTurbo = false;
                    }
                }
            } else{
                try {
                    const response = await axios.post(url, payload, { headers });
                    if (response.status === 201) {
                        console.log("\x1b[32m\x1b[1mĐã nhấn\x1b[0m");
                        console.log(response.data.player.boost);
                         if(
                             response.data.player.energy < 50 && response.data.player.boost.find(b => b.type === "energy").cnt > 0
                         ){
                            // const rs = await applyEnergyBoost(token.accessToken);
                            // if(rs){
                            //     console.log("Boost năng lượng đã được kích hoạt");
                            // }
                         } else {
                            console.log("Không đủ năng lượng hoặc không có boost năng lượng");
                            // next acccount
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
    const _listLungtungs = fs.readFileSync('contentId.txt', 'utf8').split('\r\n');
    // to array 
    for (let i = 0; i < Math.min(authorizations.length, _listLungtungs.length); i++) {
        const authorization = authorizations[i].trim();
        const _listLungtung = _listLungtungs[i].trim();
        const [contentId, time_stamp] = _listLungtung.split('|');

        const token = await getAccessTokenAndShares(authorization);
        console.log(token)
        if (token.accessToken) {
            // await claimReward(token.accessToken);
            //wait 3s
            await new Promise(resolve => setTimeout(resolve, 3000));
            // await submitTaps(access_token, energy, boost_ready, energy_ready, contentId, time_stamp, authorization);
            // const tabRs = await taptap(token.accessToken, contentId, time_stamp);
            const claimRs = await submitTaps(token , contentId, time_stamp, config);
            console.log(claimRs)
            console.log(`\n========================== `); 
        } 
        else {
            console.log("Không thể lấy token")
            break;
        }
    }

}
main();