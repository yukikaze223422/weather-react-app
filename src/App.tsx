import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { Box, Button, Divider, Heading, Select, VStack } from "@chakra-ui/react";
import { SunIcon } from "@chakra-ui/icons";
import { SubmitHandler, useForm } from "react-hook-form";
import Geocode from "react-geocode";
import PullDown from "./components/pullDown";

function App() {
  //バリデーション（react-hook-form）
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [date, setDate] = useState<any>([]);
  const [dateValue, setDateValue] = useState<any>([]);
  const [prefectures, setPrefectures] = useState<any>([]);
  const [prefCodes, setPrefCodes] = useState<any>([]);
  const [prefecture, setPrefecture] = useState<string>();
  //const [region, setRegion] = useState<string>();
  //const [lat, setLat] = useState<number | null>(null);
  //const [lng, setLng] = useState<number | null>(null);
  const [weather, setWeather] = useState<any>([]);

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
    setIsLoading(true);
    //都道府県＋市区町村で結合した文字列をもとに緯度・経度を取得し天気情報をセット
    Geocode.setApiKey(process.env.REACT_APP_GOOGLEMAP_KEY ?? "");
    await Geocode.fromAddress(prefecture + e.target.value).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        axios
          .get(
            //`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.REACT_APP_WHEATHER_KEY}&lang=ja&units=metric`
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${process.env.REACT_APP_WHEATHER_KEY}&lang=ja&units=metric`
          )
          .then((results) => {
            setWeather(results.data);
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    console.log(data);
    console.log(weather.list);
    const filterWeather = Object.values(weather.list).filter((item: any) => {
      return item.dt_txt?.indexOf(data.date) >= 0;
    });
    console.log(filterWeather);
  };

  return (
    <VStack h="100vh" bg="blue.100">
      <Box bg="white" w="md" p={4} borderRadius="md" shadow="md">
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
                    <option key={i} value={dateValue[i]}>
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
    </VStack>
  );
}

export default App;
