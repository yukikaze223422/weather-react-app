import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  Badge,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Select,
  VStack,
} from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";

function App() {
  //バリデーション（react-hook-form）
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  const [prefectures, setPrefectures] = useState<any>([]);
  const [prefCodes, setPrefCodes] = useState<any>([]);
  const [prefecture, setPrefecture] = useState<string>();
  const [region, setRegion] = useState<string>();

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
  }, []);

  const onChangePrefecture: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const prefCode = e.target.value.split(",");
    //RESAS-APIより都道府県データを取得し、都道府県とprefCodeに対応した値を格納
    axios
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

  const onChangeCity: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setRegion(prefecture + e.target.value);
  };

  const onClickWeather = () => {
    const API_KEY = "c176d7dd8a0848fd991bd65e58b2d290";
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=33.5573&lon=130.1955&appid=${API_KEY}&lang=ja&units=metric`
      )
      .then((results) => {
        console.log(results.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    console.log(data);
  };

  return (
    <VStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 都道府県選択欄 */}
        <FormControl mb={4} isInvalid={errors.prefecture ? true : false}>
          <HStack mb={3}>
            <Badge variant="solid" colorScheme="red">
              必須
            </Badge>
            <FormLabel fontWeight="bold" color="blue.400">
              都道府県
            </FormLabel>
          </HStack>
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
          <FormErrorMessage>{errors.prefecture?.message?.toString()}</FormErrorMessage>
        </FormControl>

        {/* 市区町村選択欄 */}
        <FormControl mb={4} isInvalid={errors.city ? true : false}>
          <HStack mb={3}>
            <Badge variant="solid" colorScheme="red">
              必須
            </Badge>
            <FormLabel fontWeight="bold" color="blue.400">
              市区町村
            </FormLabel>
          </HStack>
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
          <FormErrorMessage>{errors.city?.message?.toString()}</FormErrorMessage>
        </FormControl>
        <button type="submit">表示</button>
        <button onClick={onClickWeather}>表示</button>
      </form>
    </VStack>
  );
}

export default App;
