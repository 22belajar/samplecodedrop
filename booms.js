const { HttpsProxyAgent } = require("https-proxy-agent");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");

const configPath = path.join(process.cwd(), "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

class Booms {
  constructor() {
    this.headers = {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json",
      Origin: "https://booms.io",
      Referer: "https://booms.io/",
      "Sec-Ch-Ua":
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "Sec-Ch-Ua-Mobile": "?1",
      "Sec-Ch-Ua-Platform": '"Android"',
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Ims",
    };
    this.line = "~".repeat(42).white;
  }

  async waitWithCountdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(
        `===== Đã hoàn thành tất cả tài khoản, chờ ${i} giây để tiếp tục vòng lặp =====`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("");
  }

  async checkProxyIP(proxy) {
    try {
      const proxyAgent = new HttpsProxyAgent(proxy);
      const response = await axios.get("https://api.myip.com/", {
        httpsAgent: proxyAgent,
      });
      if (response.status === 200) {
        return response.data.ip;
      } else {
        this.log(`❌ Lỗi khi kiểm tra IP của proxy: ${error.message}`.red);
      }
    } catch (error) {
      this.log(`❌ Lỗi khi kiểm tra IP của proxy: ${error.message}`.red);
    }
  }

  log(msg) {
    console.log(`[*] ${msg}`);
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async title() {
    console.clear();
    console.log(`
                ███████╗███████╗██████╗ ███╗   ███╗ ██████╗ 
                ╚══███╔╝██╔════╝██╔══██╗████╗ ████║██╔═══██╗
                  ███╔╝ █████╗  ██████╔╝██╔████╔██║██║   ██║
                 ███╔╝  ██╔══╝  ██╔═══╝ ██║╚██╔╝██║██║   ██║
                ███████╗███████╗██║     ██║ ╚═╝ ██║╚██████╔╝
                ╚══════╝╚══════╝╚═╝     ╚═╝     ╚═╝ ╚═════╝ 
                `);
    console.log(
      colors.yellow(
        "Tool này được làm bởi Zepmo. Nếu bạn thấy hay thì hãy ủng hộ mình 1 subscribe nhé!"
      )
    );
    console.log(
      colors.blue(
        "Liên hệ Telegram: https://web.telegram.org/k/#@zepmoairdrop \n"
      )
    );
  }

  async login(data, proxy, index) {
    const url = "https://api.booms.io/v1/auth/create-session";
    const payload = {
      telegram_init_data: data,
    };
    try {
      const res = await axios.post(url, payload, {
        headers: this.headers,
        httpsAgent: new HttpsProxyAgent(proxy),
      });
      this.log(`[Account ${index}] ✅ Đăng nhập thành công!`.green);
      return res?.data;
    } catch (error) {
      this.log(
        `[Account ${index}}] ❌ Lỗi khi đăng nhập: ${error.message}`.red
      );
    }
  }

  async dailyReward(token, proxy, index) {
    const url = "https://api.booms.io/v1/tasks/daily-reward";
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post(
        url,
        {},
        {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy),
        }
      );
      this.log(
        `[Account ${index}] ✅ Nhận phần thưởng hàng ngày thành công!`.green
      );
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Nhận phần thưởng hàng ngày thất bại: ${error.message}`
          .red
      );
    }
  }

  async getTask(token, proxy, index) {
    const url = "https://api.booms.io/v1/tasks";
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.get(url, {
        headers: header,
        httpsAgent: new HttpsProxyAgent(proxy),
      });
      if (res?.data?.total) {
        return res.data.items;
      } else {
        this.log(`[Account ${index}] ❌ Lấy nhiệm vụ thất bại!`.red);
      }
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Lấy nhiệm vụ thất bại: ${error.message}`.red
      );
    }
  }

  async submitTask(token, proxy, index, task) {
    const url = `https://api.booms.io/v1/tasks/${task.id}/submit`;
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post(
        url,
        {},
        {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy),
        }
      );
      this.log(
        `[Account ${index}] ✅ Hoàn thành nhiệm vụ ${task.title} thành công!`
          .green
      );
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Hoàn thành nhiệm vụ ${task.title} thất bại!`.red
      );
    }
  }

  async balance(token, proxy, index) {
    const url = "https://api.booms.io/v1/balances";
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.get(url, {
        headers: header,
        httpsAgent: new HttpsProxyAgent(proxy),
      });
      if (res?.data?.items) {
        this.log(
          `[Account ${index}] 💰 Số dư: ${res.data.items[3].amount} COINS | ${res.data.items[0].amount} BMS!`
            .blue
        );
      } else {
        this.log(`[Account ${index}] ❌ Lấy số dư thất bại!`.red);
      }
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Lấy số dư thất bại: ${error.message}`.red
      );
    }
  }

  async getBooster(token, proxy, index) {
    const url = "https://api.booms.io/v1/profiles/boosts";
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.get(url, {
        headers: header,
        httpsAgent: new HttpsProxyAgent(proxy),
      });
      if (res?.data?.refill_energy) {
        return res.data.refill_energy;
      } else {
        this.log(`[Account ${index}] ❌ Lấy thông tin booster thất bại!`.red);
      }
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Lấy thông tin booster thất bại: ${error.message}`
          .red
      );
    }
  }

  async useBooster(token, proxy, index) {
    const url = "https://api.booms.io/v1/profiles/boosts/refill_energy/submit";
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post(
        url,
        {},
        {
          headers: header,
          httpsAgent: new HttpsProxyAgent(proxy),
        }
      );
      if (res?.data?.energy_current_value) {
        this.log(
          `[Account ${index}] ✅ Sử dụng Refill Energy thành công!`.green
        );
      } else {
        this.log(`[Account ${index}] ❌ Sử dụng Refill Energy thất bại!`.red);
      }
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Sử dụng Refill Energy thất bại: ${error.message}`
          .red
      );
    }
  }

  async tap(token, proxy, index) {
    const url = "https://api.booms.io/v1/profiles/tap";
    const header = {
      ...this.headers,
      authorization: `Bearer ${token}`,
    };
    const taps = Math.floor(
      Math.random() * (config.max_tap - config.min_tap + 1) + config.min_tap
    );
    const time = new Date().toISOString();
    const payload = {
      taps_count: taps,
      tapped_from: time,
    };
    try {
      const res = await axios.post(url, payload, {
        headers: header,
        httpsAgent: new HttpsProxyAgent(proxy),
      });
      if (res?.data?.energy_current_value) {
        this.log(
          `[Account ${index}] ✅ Kí đầu bò ${res?.data?.taps_used} lần | Còn lại ${res?.data?.energy_current_value} Năng lượng!`
            .green
        );
      } else {
        this.log(`[Account ${index}] ❌ Đã hết năng lượng!`.red);
        const booster = await this.getBooster(token, proxy, index);
        if (booster.current_available > 0 && booster.current_cooldown === 0) {
          await this.useBooster(token, proxy, index, booster);
          return true;
        }
        return false;
      }
    } catch (error) {
      this.log(
        `[Account ${index}] ❌ Kí đầu bò thất bại: ${error.message}`.red
      );
      return false;
    }
  }

  async process(data, proxy, index) {
    const account = await this.login(data, proxy, index);
    if (account) {
      await this.dailyReward(account.token, proxy, index);
      if (config.is_do_task) {
        const task = await this.getTask(account.token, proxy, index);
        if (task) {
          for (const t of task) {
            await this.submitTask(account.token, proxy, index, t);
          }
        }
      }
      await this.balance(account.token, proxy, index);
      while ((await this.tap(account.token, proxy, index)) !== false) {}
    }
  }

  async main() {
    await this.title();

    const dataFile = path.join(process.cwd(), "data.txt");
    const data = fs
      .readFileSync(dataFile, "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);

    const proxyFile = path.join(process.cwd(), "proxy.txt");
    const proxyList = fs
      .readFileSync(proxyFile, "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);

    if (data.length <= 0) {
      this.log("No accounts added!".red);
      await this.sleep(5000);
      process.exit();
    }

    if (proxyList.length <= 0) {
      this.log("No proxies added!".red);
      await this.sleep(5000);
      process.exit();
    }

    if (data.length !== proxyList.length) {
      this.log("Số lượng tài khoản và proxy không khớp!".red);
      await this.sleep(5000);
      process.exit();
    }
    while (true) {
      const threads = [];
      for (const [index, tgData] of data.entries()) {
        const proxy = proxyList[index];
        threads.push(this.process(tgData, proxy, index + 1));
        if (threads.length >= config.threads) {
          await Promise.all(threads);
          threads.length = 0;
        }
      }
      if (threads.length > 0) {
        await Promise.all(threads);
      }
      await this.waitWithCountdown(config.wait_time);
    }
  }
}

if (require.main === module) {
  process.on("SIGINT", () => {
    process.exit();
  });
  new Booms().main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
