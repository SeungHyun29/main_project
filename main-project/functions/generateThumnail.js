const { Storage } = require("@google-cloud/storage");
const sharp = require("sharp"); // 사진을 자르기 위한 sharp 라이브러리

// GCP Cloud Functions에서 사용할 함수
exports.generateThumbnail = async (image, context) => {
  // async로 image 이벤트의 변경 사항 수신 대기
  const imgbucket = image.bucket;
  // 현재 버킷을 찾아서 이미지가 들어 있는 버킷 저장소를 객체 할당
  console.log(imgbucket);
  const imgPath = image.name;
  console.log(imgPath);
  // imgPath에 버킷의 이미지 경로 선언 (파일명)
  //   const contentType = image.contentType;
  // contentType에 이미지의 타입
  const storage = new Storage().bucket(imgbucket);
  // 구글 클라우드 Storage 객체를 생성하고 버킷을 초기화

  // 이미지가 아닐 경우 함수를 종료
  //   if (!contentType.startWith("image/")) {
  //     return functions.logger.log("이미지가 아닙니다.");
  //   }

  // 변환할 사이즈
  const sizes = [
    // 조절할 크기의 사이즈를 담아 놓은 배열
    { size: 320, ls: "s" }, // size가 320이고 ls(목록)이 s
    { size: 640, ls: "m" }, // size가 640이고 ls(목록)이 m
    { size: 1280, ls: "l" }, // size가 1280이고 ls(목록)이 l
  ];

  // 사진이 반복돼서 생성되면 함수 종료
  if (imgPath.startsWith(`thumb/`)) return;
  // 파일이 생성됐을 때 파일의 이름에 폴더의 위치도 있음
  // 똑같은 폴더의 위치인 thumb/${sizes.ls}가 존재하면 return해서 중복 생성 방지

  await Promise.all(
    // Promise.all을 통해 병렬로 저장
    // 배열 안의 Promise들이 끝나면 한 번에 전송
    sizes.map((el) => {
      //   let thumbFolder = "";
      //   // 사이즈별로 폴더 분류
      //   if (sizes.size === 320) {
      //     thumbFolder = `thumb/s/thumb${sizes.size}/${imgPath}`; // 썸네일 디렉토리 / 사이즈 / 파일명
      //   }
      //   if (sizes.size === 640) {
      //     thumbFolder = `thumb/s/thumb${sizes.size}/${imgPath}`;
      //   }
      //   if (sizes.size === 1280) {
      //     thumbFolder = `thumb/s/thumb${sizes.size}/${imgPath}`;
      //   }

      return new Promise((resolve, reject) => {
        storage
          // storage는 사진을 업로드했을 때 적어 놨던 bucket의 내부 저장소에서
          .file(imgPath)
          // 기존의 파일 이름을
          .createReadStream()
          // 읽어서 Stream 형태로 만들기
          .pipe(sharp().resize({ width: el.size })) // Stream 형태를 width 320,640,1280 사이즈로 바꿔서 img 안에 있는 파일 활용해서 썸네일 생성
          .pipe(storage.file(`thumb/${el.ls}/${imgPath}`).createWriteStream())
          // 업로드한 저장소에 thumb/s,m,l/의 폴더에 ${name} ex. image.jpg라는 이름으로 Stream을 저장 (Write 사용)
          // 생성된 썸네일 업로드
          .on("finish", () => resolve(`thumb/${el.ls}/${imgPath}`))
          .on("error", (error) => reject(error));
      });
    })
  );
};
