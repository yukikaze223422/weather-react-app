import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { Box, Button, Divider, Flex, Heading, Image, Select, Stack, Text } from "@chakra-ui/react";
import { SunIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { SubmitHandler, useForm } from "react-hook-form";
import Geocode from "react-geocode";
import PullDown from "./components/pullDown";
import { serverTimestamp, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAlertMessage } from "./hooks/useAlertMessage";

type Inputs = {
  date: string;
  prefecture: string;
  city: string;
};

type Weather = {
  timeText: string;
  temperature: string;
  weather: string;
  icon: string;
};

function App() {
  //アラートメッセージ
  const { showMessage } = useAlertMessage();

  //バリデーション（react-hook-form）
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weatherShow, setWeatherShow] = useState<boolean>(false);
  const [date, setDate] = useState<any>([]);
  const [selectDateNumber, setSelectDateNumber] = useState<any>();
  const [dateValue, setDateValue] = useState<any>([]);
  const [prefectures, setPrefectures] = useState<any>([]);
  const [prefCodes, setPrefCodes] = useState<any>([]);
  const [prefecture, setPrefecture] = useState<string>();
  const [region, setRegion] = useState<string>();
  const [regionShow, setRegionShow] = useState<string>();
  const [weatherList, setWeatherList] = useState<Weather[]>([]);

  useEffect(() => {
    //RESAS-APIより都道府県データを取得
    axios
      .get("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
        headers: { "X-API-KEY": process.env.REACT_APP_RESAS_KEY },
      })
      .then((results) => {
        setPrefectures(results.data);
      })
      .catch((error) => {
        console.log(error);
      });

    //表示終了日
    const end = 5;
    //日本の曜日
    const week = ["日", "月", "火", "水", "木", "金", "土"];

    const dates: any = [];
    const dateValues: any = [];
    if (end !== undefined) {
      for (let i = 0; i < end; i++) {
        //取得する日付の値を設定
        let param = Date.now() + i * 86400000;
        //値から日付を取得
        let date = new Date(param);

        //dateから年を取得
        let y = date.getFullYear();
        //dateから月を取得
        let m = String(date.getMonth() + 1);
        //dateから日を取得
        let d = String(date.getDate());
        //dateから曜日を取得
        let w = date.getDay();

        //月を2桁に揃える
        if (Number(m) < 10) {
          m = "0" + m;
        }
        //日を2桁に揃える
        if (Number(d) < 10) {
          d = "0" + d;
        }

        //テキストの出力形式
        let textFormat = y + "年" + m + "月" + d + "日" + "(" + week[w] + ")";
        //値の出力形式
        let valueFormat = y + "-" + m + "-" + d;
        dates.push(textFormat);
        dateValues.push(valueFormat);
      }
      setDate(dates);
      setDateValue(dateValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangePrefecture: React.ChangeEventHandler<HTMLSelectElement> = async (e) => {
    const prefCode = e.target.value.split(",");
    //RESAS-APIより都道府県データを取得し、都道府県とprefCodeに対応した値を格納
    await axios
      .get(`https://opendata.resas-portal.go.jp/api/v1/cities?prefCode=${prefCode[0]}`, {
        headers: { "X-API-KEY": process.env.REACT_APP_RESAS_KEY },
      })
      .then((results) => {
        setPrefecture(prefCode[1]);
        setPrefCodes(results.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onChangeCity: React.ChangeEventHandler<HTMLSelectElement> = async (e) => {
    //都道府県＋市区町村
    setRegion(prefecture + e.target.value);
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    //「天気チェック」ボタンのローディング開始判定
    setIsLoading(true);

    setSelectDateNumber(data.date.split(",")[0]);
    //yyyy-mm-dd
    const selectDate = data.date.split(",")[1];

    //都道府県＋市区町村＋yyyy-mm-dd
    const document = region + selectDate;

    //Firebase firestore
    const docRef = doc(db, "weatherData", document);
    const docSnap = await getDoc(docRef);

    //画面表示用（地域）
    setRegionShow(region);

    //都道府県＋市区町村で結合した文字列をもとに緯度・経度を取得し天気情報をセット
    Geocode.setApiKey(process.env.REACT_APP_GOOGLEMAP_KEY ?? "");
    await Geocode.fromAddress(region ?? "").then(
      (response) => {
        //都道府県＋市区町村をもとに緯度・経度を取得
        const { lat, lng } = response.results[0].geometry.location;
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${process.env.REACT_APP_WHEATHER_KEY}&lang=ja&units=metric`
          )
          .then((results) => {
            //指定した日付の天気のみにするためフィルター制御
            const filterWeather = Object.values(results.data.list).filter((item: any) => {
              return item.dt_txt?.indexOf(selectDate) >= 0;
            });

            //フィルターしたデータから必要な情報のみ抽出し格納
            const list: Weather[] = [];
            filterWeather.forEach((weather: any) => {
              if (
                weather?.dt_txt &&
                weather?.main?.temp &&
                weather?.weather[0]?.main &&
                weather?.weather[0]?.icon
              ) {
                list.push({
                  timeText: weather.dt_txt.slice(11, 16),
                  temperature: weather.main.temp,
                  weather: weather.weather[0].main,
                  icon: weather.weather[0].icon,
                });
              }
            });

            //firestoreのドキュメント有無判定（ある場合はfirestoreから、ない場合はAPIから天気情報呼び出し）
            if (!docSnap.exists()) {
              setWeatherList(list);

              setDoc(doc(db, "weatherData", document), {
                weather: list,
                searchTime: serverTimestamp(),
              });
              showMessage({ title: "APIから取得しました。", status: "success" });
            } else {
              setWeatherList(docSnap.data().weather);
              showMessage({ title: "Firebaseから取得しました。", status: "success" });
            }
          })
          .catch((error) => {
            showMessage({ title: "取得に失敗しました。", status: "error" });
            console.log(error);
          })
          .finally(() => {
            setIsLoading(false);
            setWeatherShow(true);
          });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  return (
    <Flex justify="center" bg="blue.50" py={10} h={!weatherShow ? "100vh" : "auto"}>
      <Stack>
        <Box bg="white" p={4} w={{ base: "100%", md: "md" }} borderRadius="md" shadow="md">
          <Heading as="h1" size="lg" textAlign="center">
            条件を選択
          </Heading>
          <Divider my={4} />
          {/* 日時選択欄 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <PullDown messageName={errors.date} pullDownTitle="日付">
              <Select
                id="date"
                placeholder="日付を選択"
                w="100%"
                {...register("date", {
                  required: "日付を選択してください",
                })}
              >
                {Array(5)
                  .fill(null)
                  .map((_, i) => {
                    return (
                      <option key={i} value={i + "," + dateValue[i]}>
                        {date[i]}
                      </option>
                    );
                  })}
              </Select>
            </PullDown>

            {/* 都道府県選択欄 */}
            <PullDown messageName={errors.prefecture} pullDownTitle="都道府県">
              <Select
                id="prefecture"
                placeholder="都道府県を選択"
                w="100%"
                {...register("prefecture", {
                  required: "都道府県を選択してください",
                  onChange: onChangePrefecture,
                })}
              >
                {prefectures.result?.map((prefecture: any) => {
                  return (
                    <option
                      key={prefecture.prefCode}
                      value={prefecture.prefCode + "," + prefecture.prefName}
                    >
                      {prefecture.prefName}
                    </option>
                  );
                })}
              </Select>
            </PullDown>

            {/* 市区町村選択欄 */}
            <PullDown messageName={errors.city} pullDownTitle="市区町村">
              <Select
                id="city"
                placeholder="市区町村を選択"
                w="100%"
                {...register("city", {
                  required: "市区町村を選択してください",
                  onChange: onChangeCity,
                })}
              >
                {prefCodes.result?.map((prefCode: any) => {
                  return (
                    <option key={prefCode.cityCode} value={prefCode.cityName}>
                      {prefCode.cityName}
                    </option>
                  );
                })}
              </Select>
            </PullDown>

            {/* 確定ボタン */}
            <Button
              type="submit"
              leftIcon={<SunIcon />}
              w="100%"
              colorScheme="blue"
              variant="solid"
              isLoading={isLoading}
            >
              天気チェック
            </Button>
          </form>
        </Box>

        {/* 天気予報詳細 */}
        {weatherShow ? (
          <Box
            bg="white"
            p={4}
            w={{ base: "100%", md: "md" }}
            borderRadius="md"
            shadow="md"
            boxSizing="border-box"
          >
            <Heading as="h1" size="lg" textAlign="center">
              {regionShow}の天気
            </Heading>
            <Divider my={4} />

            {/* 選択日付表示 */}
            <Text fontSize="lg" fontWeight="bold">
              {date[selectDateNumber]}
            </Text>

            {/* 天気情報表示 */}
            {Array(weatherList.length)
              .fill(null)
              .map((_, i) => {
                return (
                  <Box key={i}>
                    <Image src={`http://openweathermap.org/img/w/${weatherList[i]?.icon}.png`} />
                    <Text>時間：{weatherList[i]?.timeText}</Text>
                    <Text>天気：{weatherList[i]?.weather}</Text>
                    <Text>気温：{weatherList[i]?.temperature}℃</Text>
                    <Divider my={2} borderColor="blue.200" />
                  </Box>
                );
              })}
            <Text fontSize="sm">※３時間ごとの天気予報です。</Text>

            {/* 閉じるボタン */}
            <Button
              type="button"
              leftIcon={<SmallCloseIcon />}
              mt={4}
              w="100%"
              colorScheme="red"
              variant="solid"
              onClick={() => setWeatherShow(false)}
            >
              閉じる
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Flex>
  );
}

export default App;
