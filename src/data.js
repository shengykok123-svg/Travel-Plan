// Trip data: places, hotels, foods, photo credits, meal options, default itinerary, map outline
/* ---------------- static data ---------------- */
const CITY={
  sz:{n:'深圳',cur:'CNY'},hk:{n:'香港',cur:'HKD'},mo:{n:'澳门',cur:'MOP'},zh:{n:'珠海',cur:'CNY'},gz:{n:'广州',cur:'CNY'},fs:{n:'佛山',cur:'CNY'}
};
const CUR={CNY:'¥',HKD:'HK$',MOP:'MOP ',MYR:'RM '};
const KIND={move:'交通',sight:'景点',food:'餐饮',sweet:'甜品小吃',shop:'逛街',show:'夜景/表演',hotel:'住宿',rest:'休息'};
const CAT_OF={move:'move',sight:'ticket',show:'ticket',food:'food',sweet:'food',shop:'other',rest:'other',hotel:'other'};

// name, city, lat, lng, rating (approx.), review summary, hours
const PLACES={
  szx:{n:'深圳宝安国际机场 T3',c:'sz',la:22.639,ln:113.811,r:4.4,rv:'航站楼新而大，地铁11号线直达市区。入境排队视航班情况约30–60分钟。',h:'24小时'},
  futian_st:{n:'福田站（高铁/地铁）',c:'sz',la:22.537,ln:114.055,r:4.2,rv:'地下超大车站，换乘步行较远。去香港西九龙最快约15分钟。'},
  szbay:{n:'深圳湾公园',c:'sz',la:22.505,ln:113.955,r:4.7,rv:'海滨步道很长，日落和对岸香港景色最受好评。周末傍晚人多，蚊子也多。',h:'全天开放'},
  bahe:{n:'八合里海记牛肉火锅',c:'sz',la:22.517,ln:113.936,r:4.5,rv:'潮汕牛肉现切，吊龙、匙柄口碑好。饭点常排队，建议先线上取号。',h:'约11:00–次日02:00'},
  talent:{n:'人才公园',c:'sz',la:22.513,ln:113.947,r:4.6,rv:'湖景和春笋大楼夜景很出片。灯光秀一般在周末和节假日晚上，以公告为准。',h:'全天开放'},
  lianhua:{n:'莲花山公园',c:'sz',la:22.556,ln:114.058,r:4.6,rv:'登顶约20–30分钟，山顶俯瞰福田中心区。早上凉快、人少。',h:'06:00–23:00'},
  civic:{n:'深圳市民中心 · 深圳图书馆',c:'sz',la:22.543,ln:114.059,r:4.5,rv:'大屋顶建筑壮观，中轴线拍照好看。图书馆免费入内。'},
  coco:{n:'福田 COCO Park',c:'sz',la:22.534,ln:114.055,r:4.4,rv:'餐厅集中，粤菜、茶餐厅、连锁餐饮选择多，适合午餐。'},
  hqb:{n:'华强北电子市场',c:'sz',la:22.546,ln:114.086,r:4.3,rv:'电子配件应有尽有，逛着有趣。买贵重电子产品要货比三家，注意真伪。',h:'约10:00–19:00'},
  pingan:{n:'平安金融中心 云际观光层',c:'sz',la:22.537,ln:114.051,r:4.5,rv:'116层看深圳全景，傍晚看日落转夜景最值。天气差时能见度低，买票前看天气。',h:'约10:00–22:00'},
  dongmen:{n:'东门老街',c:'sz',la:22.547,ln:114.120,r:4.2,rv:'老牌步行街，小吃和平价服饰多。人多嘈杂，注意随身物品。'},
  seaworld:{n:'蛇口海上世界',c:'sz',la:22.484,ln:113.914,r:4.5,rv:'明华轮、海边步道和餐厅集中，氛围悠闲。晚上有音乐喷泉。'},
  joyharbour:{n:'宝安欢乐港湾',c:'sz',la:22.556,ln:113.868,r:4.5,rv:'海边步道和餐厅集中，看日落很美。离宝安机场约20分钟车程，适合上飞机前的最后半天。'},
  nantou:{n:'南头古城',c:'sz',la:22.546,ln:113.921,rv:'明清老城改的文创街区：城门、窄巷、小店、咖啡馆和小吃，免费入内。',h:'街区全天开放，店铺约10:00–22:00'},
  mixc:{n:'深圳万象天地',c:'sz',la:22.541,ln:113.954,rv:'开放式街区商场，小巷里有设计店、餐厅和咖啡馆，晚上灯光好看。',h:'约10:00–22:00'},
  shekou:{n:'蛇口邮轮母港',c:'sz',la:22.478,ln:113.902,r:4.3,rv:'去珠海九洲港、澳门、香港机场的船都在这里。提前40分钟到检票。'},

  wkl:{n:'香港西九龙站',c:'hk',la:22.304,ln:114.166,r:4.3,rv:'“一地两检”，出入境都在站内完成。车站很大，预留时间。'},
  peaktram:{n:'山顶缆车（花园道总站）',c:'hk',la:22.278,ln:114.160,r:4.4,rv:'新车厢窗景好。周末排队可达1小时，早上9点前最好。',h:'07:30–23:00'},
  peak:{n:'凌霄阁 · 摩天台',c:'hk',la:22.271,ln:114.150,r:4.5,rv:'维港360°全景，香港必看。雾天什么都看不到，出发前看天气。'},
  taikwun:{n:'大馆 · 半山扶梯 · 石板街',c:'hk',la:22.281,ln:114.154,r:4.6,rv:'前中区警署改建的古迹艺术馆，免费参观。建筑和庭院很出片。',h:'约10:00–23:00'},
  yatlok:{n:'一乐烧鹅',c:'hk',la:22.283,ln:114.155,r:4.2,rv:'米其林推荐，烧鹅皮脆肉嫩。店小要拼桌，服务快但冷淡。'},
  lanfong:{n:'兰芳园（中环总店）',c:'hk',la:22.2835,ln:114.1545,r:4.1,rv:'丝袜奶茶老字号，猪扒包、葱油鸡扒捞丁受欢迎。座位挤。周日休息。'},
  pmq:{n:'PMQ 元创方 · 文武庙',c:'hk',la:22.284,ln:114.151,r:4.4,rv:'本地设计师小店和文创，免费逛。文武庙是香港最古老的庙宇之一，巨型盘香很有氛围。'},
  starferry:{n:'天星小轮（中环码头）',c:'hk',la:22.287,ln:114.161,r:4.7,rv:'百年渡轮，船票很便宜，维港景色一流。上层视野更好。'},
  h1881:{n:'1881 Heritage · 海港城',c:'hk',la:22.295,ln:114.170,r:4.4,rv:'前水警总部，维多利亚式建筑很适合拍照。里面主要是名牌店。'},
  ausmilk:{n:'澳洲牛奶公司（佐敦）',c:'hk',la:22.305,ln:114.171,r:4.0,rv:'炒蛋多士和炖奶出名。上菜极快、店员很急，这也是体验的一部分。逢周四休息。'},
  kaikai:{n:'佳佳甜品',c:'hk',la:22.3045,ln:114.1695,r:4.3,rv:'米其林推荐的平价糖水，芝麻糊、杨枝甘露口碑好。晚上排队较长。'},
  avenue:{n:'星光大道',c:'hk',la:22.293,ln:114.174,r:4.5,rv:'维港夜景最佳观赏点之一。幻彩咏香江每晚20:00，约10分钟。'},
  ladies:{n:'旺角女人街',c:'hk',la:22.319,ln:114.171,r:4.0,rv:'平价小商品和纪念品，要讲价。周边小吃多。',h:'约12:00–23:00'},

  bordergate:{n:'拱北口岸 / 澳门关闸',c:'mo',la:22.2145,ln:113.5505,r:4.0,rv:'内地往返澳门最主要的口岸。平日过关约20–30分钟，节假日人很多。',h:'约06:00–次日01:00'},
  senado:{n:'议事亭前地 · 玫瑰堂',c:'mo',la:22.193,ln:113.540,r:4.6,rv:'葡式波浪碎石地砖和殖民建筑，澳门最经典的广场。白天人多。'},
  margaret:{n:'玛嘉烈蛋挞',c:'mo',la:22.191,ln:113.541,r:4.3,rv:'半岛最有名的葡挞之一，刚出炉最好吃。通常周三休息。'},
  souvenir:{n:'手信街（大三巴街）',c:'mo',la:22.196,ln:113.541,r:4.2,rv:'钜记、咀香园等手信店林立，试吃很多。各店价格差不多。'},
  ruins:{n:'大三巴牌坊',c:'mo',la:22.1975,ln:113.5408,r:4.5,rv:'澳门地标，必打卡。上午10点前人比较少。'},
  fortaleza:{n:'大炮台 · 澳门博物馆',c:'mo',la:22.197,ln:113.543,r:4.5,rv:'俯瞰澳门半岛和大三巴，炮台免费。博物馆周一休馆。',h:'07:00–19:00'},
  wongchikei:{n:'黄枝记',c:'mo',la:22.1932,ln:113.5392,r:4.1,rv:'竹升面、虾子捞面是招牌，米其林推荐。价格偏高，份量偏小。'},
  yeeshun:{n:'义顺牛奶公司',c:'mo',la:22.1935,ln:113.5388,r:4.2,rv:'双皮奶、姜汁撞奶老字号，口感顺滑。座位少。'},
  lovelane:{n:'恋爱巷',c:'mo',la:22.1982,ln:113.5415,r:4.2,rv:'粉黄色葡式小巷，拍照点。巷子很短，几分钟就逛完。'},
  taileilok:{n:'大利来记 猪扒包',c:'mo',la:22.1553,ln:113.5566,r:4.1,rv:'澳门猪扒包代表。下午约3点有新鲜出炉的一批，排队长。'},
  taipa:{n:'官也街 · 龙环葡韵',c:'mo',la:22.1537,ln:113.5585,r:4.4,rv:'手信和小吃街，加上五座葡式绿房子。拍照和散步都舒服。'},
  venetian:{n:'威尼斯人',c:'mo',la:22.1475,ln:113.5600,r:4.5,rv:'室内运河和天花板假天空很壮观。贡多拉船要另外付费。'},
  parisian:{n:'巴黎人铁塔观景台',c:'mo',la:22.1445,ln:113.5620,r:4.3,rv:'半比例埃菲尔铁塔，傍晚看日落很美，晚上亮灯。'},
  santos:{n:'山度士葡式餐厅',c:'mo',la:22.1540,ln:113.5572,r:4.3,rv:'官也街老牌葡国菜，葡国鸡、马介休球、烧乳猪受欢迎。份量大，建议订位。'},
  wynnpalace:{n:'永利皇宫 观光缆车 · 音乐喷泉',c:'mo',la:22.150,ln:113.567,r:4.6,rv:'免费缆车绕表演湖一圈，晚上喷泉配音乐很震撼。'},

  jiuzhou:{n:'珠海九洲港',c:'zh',la:22.241,ln:113.590,r:4.1,rv:'往返深圳蛇口、香港的船都在这里。离拱北约20分钟车程。'},
  gongbei:{n:'拱北口岸广场 · 莲花路',c:'zh',la:22.219,ln:113.553,r:4.0,rv:'口岸周边商场和地下商业街多，吃饭购物方便。人流大。'},
  fisher:{n:'情侣路 · 珠海渔女',c:'zh',la:22.264,ln:113.590,r:4.5,rv:'海滨路很长，骑共享单车最舒服。渔女雕像是珠海地标。'},
  opera:{n:'日月贝（珠海大剧院）',c:'zh',la:22.2765,ln:113.5955,r:4.6,rv:'贝壳造型建筑，傍晚和亮灯后最漂亮。'},
  yeli:{n:'野狸岛',c:'zh',la:22.2795,ln:113.5920,r:4.5,rv:'环岛步道看日落和情侣路夜景，免费。'},
  wanzai:{n:'湾仔海鲜街',c:'zh',la:22.199,ln:113.530,r:4.2,rv:'现买海鲜找附近餐馆加工，便宜新鲜。先问清加工费，称重时看秤。'},
  zh_st:{n:'珠海站（城际）',c:'zh',la:22.2135,ln:113.5475,r:4.1,rv:'就在拱北口岸旁，去广州南、长隆的城际都在这里坐。'},
  chimelong:{n:'珠海长隆海洋王国',c:'zh',la:22.100,ln:113.534,r:4.6,rv:'鲸鲨馆是世界级水族馆，表演精彩。刺激项目排队久，热门表演要提前入场占位。',h:'约10:00–20:00（以官方为准）'},

  liangyuan_fs:{'n':'梁园','c':'fs','la':23.039,'ln':113.1145,'rv':'岭南四大名园之一，清代梁家的私家园林，有湖、石、竹和老宅，人少安静，适合拍照。','h':'09:00-17:00（16:40停止入园）'},
  nanfengguzao_fs:{'n':'南风古灶（石湾）','c':'fs','la':23.0052,'ln':113.0773,'rv':'有500多年历史、至今还在烧的龙窑，周边是石湾陶瓷老街和创意园，可以体验做陶。','h':'08:30-17:30；夜游只在周五至周日 18:30-21:00'},
  pingzhou_yuqijie_fs:{'n':'平洲玉器街（翠宝园一带）','c':'fs','la':23.0217,'ln':113.2098,'rv':'中国四大玉器市场之一，国家4A级景区，整条街都是翡翠店和加工作坊，可以看到师傅现场雕刻。','h':'街区全天开放，店铺大多09:00后开门，傍晚陆续关门'},
  qiandenghu_fs:{'n':'千灯湖公园','c':'fs','la':23.0525,'ln':113.1472,'rv':'南海桂城的城市中央公园，湖边有步道和灯柱，晚上灯光很漂亮，是本地人散步的地方。','h':'全天开放'},
  foshanwest:{n:'佛山西站',c:'fs',la:23.0794,ln:113.0341,rv:'佛山的高铁站，在南海狮山，离祖庙约9公里，打车约25分钟。'},
  sznorth:{'n':'深圳北站','c':'sz','la':22.6094,'ln':114.0293,'rv':'深圳最大的高铁站，地铁4、5、6号线都到。站内人多，换乘要走一段路。'},
  gzsouth:{n:'广州南站',c:'gz',la:22.989,ln:113.269,r:4.0,rv:'华南最大的高铁站之一。出站到地铁要步行10分钟以上。'},
  yinji:{n:'银记肠粉（上下九）',c:'gz',la:23.1172,ln:113.2488,r:4.1,rv:'鲜虾肠、瘦肉蛋肠口碑好，价格平。老店装修朴素。'},
  nanxin:{n:'南信牛奶甜品专家',c:'gz',la:23.1135,ln:113.2429,r:4.2,rv:'双皮奶、姜撞奶经典老字号。座位多，翻台快。'},
  shamian:{n:'沙面岛',c:'gz',la:23.107,ln:113.241,r:4.6,rv:'欧陆风情建筑群和林荫道，拍照的人很多。傍晚光线最好。'},
  yongqing:{n:'永庆坊 · 粤剧艺术博物馆',c:'gz',la:23.121,ln:113.244,r:4.4,rv:'翻新的西关骑楼老街。商业化但很好拍，博物馆免费。'},
  chiji:{n:'池记云吞面（北京路）',c:'gz',la:23.1245,ln:113.2705,r:4.0,rv:'鲜虾云吞大颗，汤底清甜。价格比普通面店高。'},
  tianzi:{n:'天字码头（珠江夜游）',c:'gz',la:23.119,ln:113.271,r:4.2,rv:'游船途经海心沙、广州塔，夜景好。不同船公司的价格和航线不同。'},
  yanjiang:{n:'沿江路 · 海珠桥',c:'gz',la:23.118,ln:113.269,rv:'北京路往南走就到珠江边，沿江路和长堤一带晚上看珠江和海珠桥夜景，免费。',h:'全天开放'},
  haixin:{n:'海心桥',c:'gz',la:23.113,ln:113.324,rv:'跨珠江的步行桥，连着花城广场和广州塔，晚上看亮灯的广州塔最近最好拍。',h:'全天开放'},
  zumiao:{n:'佛山祖庙',c:'fs',la:23.0291,ln:113.1130,rv:'岭南古庙，里面有黄飞鸿纪念馆和叶问堂，有醒狮、功夫表演（按当天场次）。',h:'约08:30–18:00'},
  lingnan:{n:'佛山岭南天地',c:'fs',la:23.0299,ln:113.1163,rv:'祖庙旁边的岭南老街区，骑楼、祠堂和小吃店，免费入内。',h:'街区全天开放'},
  diandude:{n:'点都德（北京路）',c:'gz',la:23.1238,ln:113.2692,r:4.3,rv:'广州最热门的早茶之一，虾饺、金莎红米肠、蛋挞受欢迎。8点前到可以少排队。'},
  chenclan:{n:'陈家祠',c:'gz',la:23.126,ln:113.246,r:4.6,rv:'岭南建筑装饰艺术的代表，木雕、石雕、砖雕很精致。约1小时。',h:'09:00–17:30'},
  shangxiajiu:{n:'上下九步行街',c:'gz',la:23.1168,ln:113.2505,r:4.1,rv:'骑楼街和老字号小吃多，商品偏平价。'},
  chentianji:{n:'陈添记',c:'gz',la:23.1215,ln:113.2462,r:4.1,rv:'爽脆鱼皮和艇仔粥是招牌，本地老字号。店面小，要排队。'},
  beijinglu:{n:'北京路 · 千年古道遗址',c:'gz',la:23.1250,ln:113.2700,r:4.3,rv:'玻璃罩下能看到唐代到民国的路面层。步行街商店多。'},
  gdmuseum:{n:'广东省博物馆',c:'gz',la:23.115,ln:113.327,r:4.7,rv:'免费，需在官方公众号预约。展品丰富，建筑外形像宝盒。周一休馆。',h:'09:00–17:00'},
  huacheng:{n:'花城广场',c:'gz',la:23.1185,ln:113.3255,r:4.6,rv:'广州新中轴线，傍晚看广州塔亮灯很漂亮。'},
  bingsheng:{n:'炳胜品味（珠江新城）',c:'gz',la:23.1195,ln:113.3215,r:4.3,rv:'黑叉烧、脆皮烧鹅、鱼生出名，米其林推荐。人均偏高，要订位。'},
  cantontower:{n:'广州塔',c:'gz',la:23.106,ln:113.325,r:4.5,rv:'白云观光大厅看全城夜景。摩天轮和极速云霄要另外付费。',h:'约09:30–22:30'},
  gzjj:{n:'广州酒家（文昌总店）',c:'gz',la:23.1195,ln:113.2485,r:4.3,rv:'老字号早茶和手信（鸡仔饼、老婆饼）很出名。装修传统。'},
  sacredheart:{n:'石室圣心大教堂',c:'gz',la:23.1165,ln:113.2690,r:4.6,rv:'全花岗岩建成的哥特式教堂，外观非常震撼，拍照好看。内部开放时间有限。'},
  gzeast:{n:'广州东站',c:'gz',la:23.150,ln:113.325,r:3.9,rv:'穗深城际可以直达深圳机场站。'}
};

// p = 双床房/大床房每晚，p3 = 三人房（或双床房+加床）每晚，都是估价
const HOTELS={
  sz:[
    {id:'sz1',tier:'基础 · 最省',n:'汉庭酒店（深圳福田会展中心店）',area:'福田 · 会展中心',la:22.5345,ln:114.0625,p:260,p3:340,r:4.4,rv:'干净、价格低，地铁近。房间小，隔音和早餐一般。',pro:['最便宜','地铁方便'],con:['房间小','三人房少，要提前问']},
    {id:'sz2',tier:'推荐 · 性价比',n:'全季酒店（深圳福田会展中心店）',area:'福田 · 会展中心',la:22.535,ln:114.061,p:380,p3:500,r:4.6,rv:'和汉庭同一集团，但装修、床品、隔音都更好。步行到地铁站很近。',pro:['质量稳定','地铁方便','有洗衣房'],con:['房间不算大']},
    {id:'sz3',tier:'舒适 · 贵一点',n:'亚朵酒店（深圳福田会展中心店）',area:'福田 · 会展中心',la:22.5385,ln:114.064,p:560,p3:720,r:4.7,rv:'床品和早餐口碑好，服务热情，有夜宵。步行到福田站约10–15分钟。',pro:['床品舒服','早餐好'],con:['周末涨价明显']}
  ],
  zh:[
    {id:'zh1',tier:'基础 · 最省',n:'汉庭酒店（珠海拱北口岸店）',area:'拱北 · 口岸步行10分钟',la:22.2195,ln:113.5525,p:220,p3:300,r:4.3,rv:'便宜干净，走路到拱北口岸方便。设施较基础。',pro:['最便宜','离口岸近'],con:['房间小','早餐一般']},
    {id:'zh2',tier:'推荐 · 性价比',n:'全季酒店（珠海拱北口岸店）',area:'拱北 · 口岸步行10分钟',la:22.219,ln:113.552,p:320,p3:430,r:4.5,rv:'走路到拱北口岸约10分钟，干净舒适。去澳门、珠海站、长隆都方便。',pro:['离口岸和珠海站近','质量稳定'],con:['隔音一般']},
    {id:'zh3',tier:'舒适 · 房间大',n:'维也纳国际酒店（珠海拱北口岸店）',area:'拱北 · 口岸附近',la:22.2175,ln:113.5555,p:380,p3:480,r:4.5,rv:'房间比同价位大，早餐选择多。部分房间装修较旧，入住时可以要求换新装修的房。',pro:['房间大','早餐丰富'],con:['各间房装修新旧不一']}
  ],
  fs:[
    {'id':'fs1','tier':'基础 · 地铁旁','n':'如家商旅酒店（佛山祖庙地铁站店）','area':'禅城 · 祖庙','la':23.0277,'ln':113.111,'p':220,'p3':300,'r':4.7,'rv':'就在祖庙地铁站旁边，走路到祖庙、岭南天地几分钟。房间干净，价格实惠。部分房间没窗，订房时选有窗的。','pro':['祖庙站旁，去广州一程地铁','走路到祖庙、岭南天地'],'con':['部分房间没窗']}
  ],
  gz:[
    {id:'gz1',tier:'基础 · 最省',n:'汉庭酒店（广州北京路步行街店）',area:'越秀 · 北京路',la:23.1262,ln:113.2722,p:350,p3:450,r:4.4,rv:'在北京路中心，吃喝方便。房间小。广交会期间价格上涨。',pro:['位置好','最便宜'],con:['房间小','广交会期间难订']},
    {id:'gz2',tier:'推荐 · 性价比',n:'全季酒店（广州北京路步行街店）',area:'越秀 · 北京路',la:23.1255,ln:113.2715,p:480,p3:620,r:4.6,rv:'在北京路中心，干净舒适，步行到早茶店和地铁站都近。广交会期间价格上涨。',pro:['位置好','质量稳定'],con:['广交会期间难订']},
    {id:'gz3',tier:'舒适 · 贵一点',n:'亚朵酒店（广州北京路店）',area:'越秀 · 北京路',la:23.128,ln:113.268,p:720,p3:900,r:4.7,rv:'服务和早餐好评多，步行到北京路、公园前地铁站方便。',pro:['早餐好','交通方便'],con:['广交会期间价格高']}
  ]
};
const HOTEL_ANCHOR={sz:'futian_st',zh:'bordergate',gz:'beijinglu',fs:'zumiao'};

const FOODS=[
  {n:'椰子鸡火锅',c:'sz',w:'sijiyelin_ns',p:'¥100–130/人',d:'椰青水做汤底煮文昌鸡，先喝汤再吃鸡，清甜不辣。深圳本地人很爱吃。',g:'coconutchicken'},
  {n:'椰子鸡火锅',c:'sz',w:'runyuan',p:'¥90–130/人',d:'深圳特色，椰青水做汤底，清甜不腻。',g:'coconutchicken'},
  {n:'潮汕卤鹅',c:'sz',w:'chenpp',p:'¥80–120/人',d:'卤水香浓，鹅肉切片配蒜醋。',g:'braisedgoose'},
  {n:'广式肠粉',c:'sz',w:null,p:'¥12–25',d:'深圳早餐首选，鲜虾、叉烧、瘦肉蛋肠配酱油。',g:'cheungfun'},
  {n:'烧鹅濑粉',c:'hk',w:'yatlok',p:'HK$80–130',d:'皮脆肉嫩、油香足，配濑粉或白饭。',g:'roastgoose'},
  {n:'鲜虾云吞面',c:'hk',w:'maks',p:'HK$50–80',d:'竹升面弹牙，云吞包整只鲜虾。',g:'wonton'},
  {n:'丝袜奶茶 · 菠萝油',c:'hk',w:'tsuiwah_central',p:'HK$40–60',d:'港式茶餐厅的经典组合。',g:['milktea','pineapplebun']},
  {n:'港式蛋挞',c:'hk',w:'taicheong',p:'HK$10–15/个',d:'牛油挞皮，蛋浆嫩滑。',g:'eggtart'},
  {n:'炒蛋多士 · 炖奶',c:'hk',w:'ausmilk',p:'HK$50–70',d:'滑蛋多士出名，炖奶香浓。',g:'adc'},
  {n:'焗猪扒饭',c:'hk',w:'mido',p:'HK$80–100',d:'茶餐厅经典，茄汁芝士焗饭。',g:'porkchoprice'},
  {n:'杨枝甘露 · 芝麻糊',c:'hk',w:'kaikai',p:'HK$30–45',d:'港式糖水代表。',g:['mangosago','sesame']},
  {n:'鸡蛋仔 · 咖喱鱼蛋',c:'hk',w:'ladies',p:'HK$20–35',d:'街头小吃，旺角一带最多。',g:['eggwaffle','fishball']},
  {n:'葡挞',c:'mo',w:'margaret',p:'MOP 12/个',d:'酥皮层次多，焦糖面，趁热吃。',g:'nata'},
  {n:'猪扒包',c:'mo',w:'taileilok',p:'MOP 40–50',d:'猪扒腌得入味，面包外脆。',g:'porkchopbun'},
  {n:'虾子捞面 · 云吞面',c:'mo',w:'wongchikei',p:'MOP 70–100',d:'竹升面弹牙，撒满虾子。',g:'wonton'},
  {n:'双皮奶 · 姜汁撞奶',c:'mo',w:'yeeshun',p:'MOP 30–40',d:'奶味浓，冷热都有。',g:['doubleskin','gingermilk']},
  {n:'葡国鸡 · 马介休球',c:'mo',w:'santos',p:'MOP 180–250/人',d:'澳门土生葡菜，适合晚餐。',g:['galinha','bacalhau','macfood']},
  {n:'杏仁饼 · 猪肉脯',c:'mo',w:'souvenir',p:'MOP 60–150/盒',d:'最常见的澳门手信，可以先试吃。',g:['almond','bakkwa']},
  {n:'海鲜代加工',c:'zh',w:'wanzai',p:'¥120–200/人',d:'生蚝、濑尿虾、花甲，按斤称价。',g:'seafood'},
  {n:'横琴生蚝',c:'zh',w:'wanzai',p:'¥10–15/只',d:'珠海特产，蒜蓉烤或者煮生蚝粥。',g:'oyster'},
  {n:'早茶',c:'gz',w:'diandude',p:'¥80–120/人',d:'虾饺、烧卖、叉烧包、凤爪、红米肠。',g:['dimsum','charsiubao']},
  {n:'鲜虾肠粉',c:'gz',w:'yinji',p:'¥20–30',d:'西关肠粉，皮薄滑，鲜虾肠、瘦肉蛋肠都好吃。',g:'cheungfun'},
  {n:'双皮奶 · 姜撞奶',c:'gz',w:'nanxin',p:'¥15–25',d:'广州经典甜品。',g:['doubleskin','gingermilk']},
  {n:'鱼皮 · 艇仔粥',c:'gz',w:'chentianji',p:'¥30–50',d:'西关老字号风味。',g:'congee'},
  {n:'啫啫煲',c:'gz',w:'huishijia',p:'¥120–180/人',d:'砂锅猛火啫香，鸡煲、黄鳝煲最受欢迎。',g:'claypot'},
  {n:'黑叉烧 · 烧鹅',c:'gz',w:'bingsheng',p:'¥150–220/人',d:'粤菜酒家招牌，适合晚餐。',g:['charsiu','roastgoose']},
  {n:'鸡仔饼 · 老婆饼',c:'gz',w:'gzjj',p:'¥40–100/盒',d:'广州手信。',g:['chickenbiscuit','wifecake']}
];

/* ---------------- photos, meal options ---------------- */
// photos: freely licensed Wikimedia Commons images of each dish / hotel brand, published with the page
const GALLERY={"beefhotpot":[{"f":"img/beefhotpot-1.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Chaoshan_Beef_Hot_Pot_at_Baheli_Haiji,_ZGC1_(20221003132726).jpg"},{"f":"img/beefhotpot-2.jpg","a":"Clarayyt","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Chaoshan_Cuisine3.jpg"},{"f":"img/beefhotpot-3.jpg","a":"Guwiqiie","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E7%89%9B%E8%82%89%E7%81%AB%E9%94%85.jpg"},{"f":"img/beefhotpot-4.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Shantou_Baheli_Haiji_Beef_Hotpot_at_ZGC1_(20221003125830).jpg"}],"cheungfun":[{"f":"img/cheungfun-1.jpg","a":"ZhengZhou","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Dried_shrimp_rice_noodle_roll.jpg"},{"f":"img/cheungfun-2.jpg","a":"DragonSamYU","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Rice_Noodle_Roll_-_Chaozhou_-_20170302_(2).jpg"},{"f":"img/cheungfun-3.jpg","a":"No machine-readable author provided. GS417~commonswiki assum","l":"CC BY-SA 2.5","p":"https://commons.wikimedia.org/wiki/File:GD_Rice_Product_1.JPG"},{"f":"img/cheungfun-4.jpg","a":"Eukbimga","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_Food_Rice_Noodle_Roll_with_Sesame.JPG"}],"coconutchicken":[{"f":"img/coconutchicken-1.jpg","a":"HOISAIWIM TUNGWAH","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:SZ_Shenzhen_shopping_mall_shop_%E5%8E%9F%E5%91%B3%E4%B8%BB%E7%BE%A9_%E6%A4%B0%E5%AD%90%E9%9B%9E_restaurant_July_2025_N13P_01.jpg"}],"suancaiyu":[{"f":"img/suancaiyu-1.jpg","a":"Alpha from Melbourne, Australia","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:%E9%85%B8%E8%8F%9C%E9%B1%BC_Preserved_Mustard_Green_with_Fish_-_Charming_Spice_AUD24.80_(4104355401).jpg"},{"f":"img/suancaiyu-2.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Suancaiyu_rice_value-set_at_Hehegu,_Dongzhimen_(20211220172415).jpg"}],"braisedgoose":[{"f":"img/braisedgoose-1.jpg","a":"NanakoT","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E5%B7%9E%E6%BB%B7%E9%B5%9D%E7%89%87_(4884050087).jpg"},{"f":"img/braisedgoose-2.jpg","a":"Alpha from Melbourne, Australia","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:%E5%8D%A4%E6%B0%B4%E9%B9%85%E7%89%87_Braised_Goose_Breast_-_%E6%9C%9D%E6%B1%9F%E6%98%A5_Chiu_Chow_Garden,_Taikoo_(2229895089).jpg"}],"roastgoose":[{"f":"img/roastgoose-1.jpg","a":"Sakaori","l":"CC BY 3.0","p":"https://commons.wikimedia.org/wiki/File:Roast_goose_in_yat_lok_restaurant.JPG"},{"f":"img/roastgoose-2.jpg","a":"Guangzhou Private Tours by Janvi","l":"CC BY 4.0","p":"https://commons.wikimedia.org/wiki/File:Cantonese_roast_goose_served_in_Guangzhou,_China,_June_2026.jpg"},{"f":"img/roastgoose-3.jpg","a":"Dinkun Chen","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Cantonese_roasted_goose.jpg"},{"f":"img/roastgoose-4.jpg","a":"Ceeseven","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Roast_Goose_Rice.JPG"}],"wonton":[{"f":"img/wonton-1.jpg","a":"cattan2011","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Wonton_noodle-_Sai_Yung_Kee,_Hong_Kong.jpg"},{"f":"img/wonton-2.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Wonton_noodles_at_Mak_An_Kee,_Chung_Kee_(20180913105025).jpg"},{"f":"img/wonton-3.jpg","a":"LN9267","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:The_Peak_Mak%27s_Noodle_Wonton_noodle_soup_09-11-2021.jpg"},{"f":"img/wonton-4.jpg","a":"Angeimoarm","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_Sai_Ying_Pun_Centre_Street_%E9%9B%B2%E5%90%9E_Wonton_noodle_July-2012.JPG"}],"milktea":[{"f":"img/milktea-1.jpg","a":"WiNG","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Hong_Kong-style_Milk_Tea.jpg"},{"f":"img/milktea-2.jpg","a":"Nikoletic126","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:Hong_Kong_Milk_Tea,_Cha_Chaan_Teng-style_with_Black_and_White_cup.jpg"},{"f":"img/milktea-3.jpg","a":"K.C. Tang","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Hong_Kong_milk_tea.jpg"}],"porkchopbun":[{"f":"img/porkchopbun-1.jpg","a":"K.Y.K.Z.K.","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Pork_chop_bun_with_ice_milk_tea.jpg"},{"f":"img/porkchopbun-2.jpg","a":"Andy Li","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:Pork_Chop_Bun_and_Hong_Kong_style_Milk_Tea_(hot)_-_CK_Bistro_2025-09-16.jpg"}],"pineapplebun":[{"f":"img/pineapplebun-1.jpg","a":"Dennis Wong","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Pineapple_Bun_with_Butter_inside.jpg"},{"f":"img/pineapplebun-2.jpg","a":"Evancyk","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Pineapple_bun_and_milk_tea.jpg"},{"f":"img/pineapplebun-3.jpg","a":"Dennis Wong from Hong Kong, Hong Kong","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Pineapple_bun.jpg"}],"eggtart":[{"f":"img/eggtart-1.jpg","a":"stu_spivack","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:Hong_Kong_Dan_tat.jpg"},{"f":"img/eggtart-2.jpg","a":"Cathiniamoa","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_food_sweet_egg_tart_%E5%8A%A0%E5%88%A9%E5%B9%B4_Catherine_Bakery_May-2012.JPG"},{"f":"img/eggtart-3.jpg","a":"CCheungimm","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Two_Egg_Tarts_CC_02_HK.jpg"},{"f":"img/eggtart-4.jpg","a":"Mk2010","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Tai_Cheong_Bakery_(Hong_Kong).jpg"}],"nata":[{"f":"img/nata-1.jpg","a":"Pauloleong2002","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Portuguese_egg_tart_in_Macau.jpg"},{"f":"img/nata-2.jpg","a":"Jason Goh","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:Portuguese_egg_tart.jpg"},{"f":"img/nata-3.jpg","a":"Iidxplus","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Lord_stow.jpg"},{"f":"img/nata-4.jpg","a":"LN9267","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Coloane_Lord_Stow%27s_Bakery_egg_tart_25-04-2019.png"}],"adc":[{"f":"img/adc-1.jpg","a":"圍棋一級","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Australia_Dairy_Company_outlook.JPG"},{"f":"img/adc-2.jpg","a":"City Foodsters","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Australia_Dairy_Company_-_Ham_and_Egg_Sandwich.jpg"},{"f":"img/adc-3.jpg","a":"Peachyeung316","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Australia_Dairy_Company_Hong_Kong.jpg"}],"mangosago":[{"f":"img/mangosago-1.jpg","a":"relgar","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Mango_pomelo_sago.jpg"},{"f":"img/mangosago-2.jpg","a":"Blowing Puffer Fish","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Mango_Pomelo_Sago_by_Lei_Garden.jpg"},{"f":"img/mangosago-3.jpg","a":"Thomas.Lu","l":"CC BY 3.0","p":"https://commons.wikimedia.org/wiki/File:MangoPomeloSago_1.jpg"}],"sesame":[{"f":"img/sesame-1.jpg","a":"bryan... from Taipei, Taiwan","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:Black_sesame_paste.jpg"},{"f":"img/sesame-2.jpg","a":"Gnuf from (optional)","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:BlacksesameSoup.jpg"},{"f":"img/sesame-3.jpg","a":"2225Group8","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Chinese_tongsui_-_Sesame_paste.jpg"}],"eggwaffle":[{"f":"img/eggwaffle-1.jpg","a":"User:SarahStierch","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Egg_waffle_-_sarah_stierch.jpg"},{"f":"img/eggwaffle-2.jpg","a":"Morsesp3","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_Lower_Wong_Tai_Sin_Eatate_Tung_Tau_Tsuen_Road_n_Ching_Tak_Street_%E9%9B%9E%E8%9B%8B%E4%BB%94.JPG"},{"f":"img/eggwaffle-3.jpg","a":"Yatadeihom","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_food_products_%E9%9B%9E%E8%9B%8B%E4%BB%94_eggette_bubble_waffle_Kitchen_tools_Utensils_Sheung_Wan_shop_April-2012.JPG"}],"fishball":[{"f":"img/fishball-1.jpg","a":"Thomas.Lu","l":"CC BY 3.0","p":"https://commons.wikimedia.org/wiki/File:Curry_Fish_Balls_1A.jpg"},{"f":"img/fishball-2.jpg","a":"Ceeseven","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Curry_Fish_Balls.jpg"},{"f":"img/fishball-3.jpg","a":"Silvermetals","l":"CC BY 3.0","p":"https://commons.wikimedia.org/wiki/File:Curry_Fishball.JPG"}],"seafood":[{"f":"img/seafood-1.jpg","a":"TWMEAU rOEPPOUL","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E7%8F%A0%E6%B5%B7_Zhuhai_%E9%A6%99%E6%B4%B2_Xiangzhou_%E7%81%A3%E4%BB%94%E6%B5%B7%E9%AE%AE%E8%A1%97_WanZai_Seafood_Street_November_2024_R12S_01.jpg"},{"f":"img/seafood-2.jpg","a":"TWMEAU rOEPPOUL","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E7%8F%A0%E6%B5%B7_Zhuhai_%E9%A6%99%E6%B4%B2_Xiangzhou_%E7%81%A3%E4%BB%94%E6%B5%B7%E9%AE%AE%E8%A1%97_WanZai_Seafood_Street_November_2024_R12S_03.jpg"},{"f":"img/seafood-3.jpg","a":"TWMEAU rOEPPOUL","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E7%8F%A0%E6%B5%B7_Zhuhai_%E9%A6%99%E6%B4%B2_Xiangzhou_%E7%81%A3%E4%BB%94%E6%B5%B7%E9%AE%AE%E8%A1%97_WanZai_Seafood_Street_November_2024_R12S_04.jpg"},{"f":"img/seafood-4.jpg","a":"TWMEAU rOEPPOUL","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E7%8F%A0%E6%B5%B7_Zhuhai_tour_view_%E7%81%A3%E4%BB%94%E6%B5%B7%E9%AE%AE%E8%A1%97_WanZai_Seafood_Street_November_2024_R12S_100.jpg"}],"oyster":[{"f":"img/oyster-1.jpg","a":"Jason Lam","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:Shucking_and_grilling_oysters_-_Drago%27s.jpg"},{"f":"img/oyster-2.jpg","a":"David Monniaux","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Oysters_p1040741.jpg"}],"dimsum":[{"f":"img/dimsum-1.jpg","a":"sfllaw of Flickr","l":"CC BY-SA 2.0","p":"https://commons.wikimedia.org/wiki/File:Xiajiao.jpg"},{"f":"img/dimsum-2.jpg","a":"Solomon203","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:3_pieces_of_har_gow_at_Plum_Blossom_Room_20230125.jpg"},{"f":"img/dimsum-3.jpg","a":"Rousgmwicna","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_dim_sum_food_-_streamed_%E8%9D%A6%E9%A4%83_Har_gow_prawn_dumping_white_flour_Feb-2014_MCK.jpg"},{"f":"img/dimsum-4.jpg","a":"MeiOLA 2290 WMENSZ","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E5%BB%A3%E5%B7%9E_Guangzhou_%E8%8D%94%E7%81%A3%E5%8D%80_Liwan_%E9%BE%8D%E6%B4%A5%E8%A5%BF%E8%B7%AF_Longjin_West_Road_shop_%E6%B3%AE%E6%BA%AA%E9%85%92%E5%AE%B6_Pan_Xi_Restaurant_%E9%BB%9E%E5%BF%83_dim_sum_list_June_2025_R12S.jpg"}],"charsiu":[{"f":"img/charsiu-1.jpg","a":"Simon Shek","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Charsiu.jpg"},{"f":"img/charsiu-2.jpg","a":"Peachyeung316","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Char_Siu_and_Siu_Yuk_in_Tai_Po.jpg"}],"charsiubao":[{"f":"img/charsiubao-1.jpg","a":"Maksym Kozlenko","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Steamed_roast_pork_bun.jpg"},{"f":"img/charsiubao-2.jpg","a":"Puidsauh BOROMAW","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:HK_SW_%E4%B8%8A%E7%92%B0_Sheung_Wan_%E6%98%9F%E6%9C%88%E6%A8%93_Sky_Cuisine_Chinese_Restaurant_breakfast_steamed_food_dim_sum_%E5%8F%89%E7%87%92%E5%8C%85_Char_Siu_Bao_October_2022_Px3_03.jpg"},{"f":"img/charsiubao-3.jpg","a":"Takeaway","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Char_siu_bao.jpg"}],"congee":[{"f":"img/congee-1.jpg","a":"ZhengZhou","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Cantonese_Sampan_Congee_(Boat_Congee).jpeg"},{"f":"img/congee-2.jpg","a":"EllieWzpp","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Sampan_Congee.jpg"},{"f":"img/congee-3.jpg","a":"DragonSamYU","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Boat_Congee_-_Whampoa_Anchorage.jpg"}],"almond":[{"f":"img/almond-1.jpg","a":"Mx. Granger","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:Almond_cookies_being_made_in_Macau.jpg"},{"f":"img/almond-2.jpg","a":"No machine-readable author provided. Mo707 assumed (based on","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Macau_Koi_Kei_Bakery_Almond_Biscuits_2.JPG"},{"f":"img/almond-3.jpg","a":"Yumeto","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:20260806_Almond_biscuits_at_Pastelaria_St._Paulo.jpg"}],"galinha":[{"f":"img/galinha-1.jpg","a":"Fancy-cats-are-happy-cats","l":"Public domain","p":"https://commons.wikimedia.org/wiki/File:African_chicken_macau.JPG"},{"f":"img/galinha-2.jpg","a":"Pauloleong2002","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Chicken_and_beef_in_Portuguese_style.jpg"},{"f":"img/galinha-3.jpg","a":"LeonardKong","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:%E8%91%A1%E5%BC%8F%E7%83%A7%E9%B8%A1%E9%87%80%E9%A5%AD_(8185173956).jpg"}],"bacalhau":[{"f":"img/bacalhau-1.jpg","a":"Ralbahitha","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Past%C3%A9is_de_Bacalhau_~_Salt_Cod_Fritters.jpg"}],"claypot":[{"f":"img/claypot-1.jpg","a":"Chumanchun","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:%E5%95%AB%E5%95%AB%E9%9B%9E%E7%85%B2.jpg"}],"porkchoprice":[{"f":"img/porkchoprice-1.jpg","a":"Ceeseven","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Baked_Pork_Chop_Rice_in_Hong_Kong_Cha_Chaan_Teng.jpg"},{"f":"img/porkchoprice-2.jpg","a":"bortescristian","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Baked_Pork_Chop_Rice.jpg"}],"chickenbiscuit":[{"f":"img/chickenbiscuit-1.jpg","a":"Benjwong","l":"Public domain","p":"https://commons.wikimedia.org/wiki/File:Gaizai_crackers.jpg"},{"f":"img/chickenbiscuit-2.jpg","a":"Samsing Haui MAENMIN Haujng","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:HK_WC_%E7%81%A3%E4%BB%94%E9%81%93_Road_market_shop_%E9%9B%9E%E4%BB%94%E9%A4%85%E5%A4%A7%E7%8E%8B_night_October_2023_R12S_01.jpg"}],"wifecake":[{"f":"img/wifecake-1.jpg","a":"Eukbimga","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_Food_Sweetheart_Wife_Cakes_@_Sheung_Wan_Morrison_Street_%E8%80%81%E5%A9%86%E9%A4%85.jpg"},{"f":"img/wifecake-2.jpg","a":"Benjwong at English Wikipedia","l":"Public domain","p":"https://commons.wikimedia.org/wiki/File:Wifecake.jpg"},{"f":"img/wifecake-3.jpg","a":"Angeimoarm","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:HK_food_%E8%80%81%E5%A9%86%E9%A4%85_Sweetheart_cake_July-2012.JPG"}],"doubleskin":[{"f":"img/doubleskin-1.jpg","a":"Guanlin (Gary) He","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Double_skin_milk.jpg"},{"f":"img/doubleskin-2.jpg","a":"Pauloleong2002","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Double_skin_milk_with_mango.jpg"},{"f":"img/doubleskin-3.jpg","a":"ZhengZhou","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Double_skin_milk_with_red_beans.jpg"}],"gingermilk":[{"f":"img/gingermilk-1.jpg","a":"Chika","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Ginger_Milk_Pudding.jpg"}],"bakkwa":[{"f":"img/bakkwa-1.jpg","a":"shankar s. from Poona (pune), India, India","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Pork_Jelly_Local_jerky_(7821987748).jpg"},{"f":"img/bakkwa-2.jpg","a":"No machine-readable author provided. Mo707 assumed (based on","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Macau_Food_Jerked_Beef.JPG"}],"macfood":[{"f":"img/macfood-1.jpg","a":"Pauloleong2002","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Portuguese_food_in_Macau_2.jpg"},{"f":"img/macfood-2.jpg","a":"Pauloleong2002","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Cuisine_in_Macau_1.jpg"},{"f":"img/macfood-3.jpg","a":"Pauloleong2002","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:%E8%91%A1%E5%BC%8F%E9%9B%9C%E7%87%B4.jpg"}],"taotaoju":[{"f":"img/taotaoju-1.jpg","a":"Gzdavidwong","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:TaoTaoJu.JPG"},{"f":"img/taotaoju-2.jpg","a":"Jackl","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:TaoTaoJu_daytime.jpg"}],"panxi":[{"f":"img/panxi-1.jpg","a":"MeiOLA 2290 WMENSZ","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E5%BB%A3%E5%B7%9E_Guangzhou_%E8%8D%94%E7%81%A3%E5%8D%80_Liwan_%E9%BE%8D%E6%B4%A5%E8%A5%BF%E8%B7%AF_Longjin_West_Road_shop_%E6%B3%AE%E6%BA%AA%E9%85%92%E5%AE%B6_Pan_Xi_Restaurant_%E9%BB%9E%E5%BF%83_dim_sum_June_2025_R12S_30.jpg"},{"f":"img/panxi-2.jpg","a":"MeiOLA 2290 WMENSZ","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:GD_%E5%BB%A3%E6%9D%B1_Guangdong_%E5%BB%A3%E5%B7%9E_Guangzhou_%E8%8D%94%E7%81%A3%E5%8D%80_Liwan_%E9%BE%8D%E6%B4%A5%E8%A5%BF%E8%B7%AF_Longjin_West_Road_shop_%E6%B3%AE%E6%BA%AA%E9%85%92%E5%AE%B6_Pan_Xi_Restaurant_%E9%BB%9E%E5%BF%83_dim_sum_June_2025_R12S_31.jpg"}],"hanting":[{"f":"img/hanting-1.jpg","a":"Suginami","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:Hanting_hotel_in_China_2024.jpg"},{"f":"img/hanting-2.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Hanting_Beijing_Guanyuanqiao_Hotel_(20240907182158).jpg"}],"jihotel":[{"f":"img/jihotel-1.jpg","a":"Shwangtianyuan","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Hanting_Hotel_and_Ji_Hotel_at_Chayuanchang-20240917.jpg"},{"f":"img/jihotel-2.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:JI_Hotel_at_Tuanjiehu_(20221026135912).jpg"}],"atour":[{"f":"img/atour-1.jpg","a":"西安兵马俑","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:%E4%BA%9A%E6%9C%B5%E9%85%92%E5%BA%97%EF%BC%88%E4%B8%89%E9%98%B3%E5%B9%BF%E5%9C%BA%E5%BA%97%EF%BC%8920200911.jpg"},{"f":"img/atour-2.jpg","a":"Windmemories","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:20220302_Atour_Hotel_on_Chengdong_Road.jpg"}],"vienna":[{"f":"img/vienna-1.jpg","a":"Huangdan2060","l":"CC BY 3.0","p":"https://commons.wikimedia.org/wiki/File:Vienna_International_Hotel_2021111303.jpg"},{"f":"img/vienna-2.jpg","a":"N509FZ","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Vienna_International_Hotel,_Wenchang_(20230326180708).jpg"}]};
const GAL_NAME={beefhotpot:'潮汕牛肉火锅',cheungfun:'肠粉',coconutchicken:'椰子鸡',suancaiyu:'酸菜鱼',braisedgoose:'潮汕卤鹅',roastgoose:'烧鹅',wonton:'云吞面',milktea:'港式奶茶',porkchopbun:'猪扒包',pineapplebun:'菠萝油',eggtart:'港式蛋挞',nata:'葡挞',adc:'澳洲牛奶公司',mangosago:'杨枝甘露',sesame:'芝麻糊',eggwaffle:'鸡蛋仔',fishball:'咖喱鱼蛋',seafood:'湾仔海鲜街',oyster:'生蚝',dimsum:'早茶点心',charsiu:'叉烧',charsiubao:'叉烧包',congee:'艇仔粥',almond:'杏仁饼',galinha:'葡国鸡 / 非洲鸡',bacalhau:'马介休球',claypot:'啫啫煲',porkchoprice:'焗猪扒饭',chickenbiscuit:'鸡仔饼',wifecake:'老婆饼',doubleskin:'双皮奶',gingermilk:'姜撞奶',bakkwa:'猪肉脯',macfood:'澳门葡国菜',taotaoju:'陶陶居',panxi:'泮溪酒家',hanting:'汉庭酒店',jihotel:'全季酒店',atour:'亚朵酒店',vienna:'维也纳酒店'};
const HOTEL_BRAND={sz1:'hanting',zh1:'hanting',gz1:'hanting',sz2:'jihotel',zh2:'jihotel',gz2:'jihotel',sz3:'atour',gz3:'atour',zh3:'vienna'};

Object.assign(PLACES,{
  taier:{n:'太二酸菜鱼（COCO Park 一带分店）',c:'sz',la:22.5335,ln:114.0545,r:4.3,rv:'酸菜鱼招牌，鱼片嫩、酸辣开胃。这个品牌规定超过4人不接待，4个人刚好坐一桌。'},
  runyuan:{n:'润园四季椰子鸡（福田分店）',c:'sz',la:22.5415,ln:114.0600,r:4.5,rv:'深圳特色椰子鸡火锅，汤底清甜，鸡肉嫩。饭点要排队，可以线上取号。分店位置以地图为准。'},
  chenpp:{n:'陈鹏鹏潮汕菜馆（深圳分店）',c:'sz',la:22.5440,ln:114.0480,r:4.4,rv:'深圳有名的潮汕菜，卤鹅、蚝烙、粿条好评多。分店位置以地图为准。'},
  manji_sz:{n:'满记甜品（海岸城一带）',c:'sz',la:22.5168,ln:113.9365,r:4.1,rv:'连锁港式甜品，芒果班戟、杨枝甘露口味稳定。'},
  maks:{n:'麦奀云吞面世家（中环）',c:'hk',la:22.2833,ln:114.1553,r:4.1,rv:'一小碗，但云吞鲜虾饱满，汤底用大地鱼熬。份量小，价格偏高。'},
  tsimchai:{n:'沾仔记（中环）',c:'hk',la:22.2839,ln:114.1546,r:4.1,rv:'米其林推荐的云吞面，份量比麦奀大，价格实惠。'},
  kampai:{n:'甘牌烧鹅（湾仔）',c:'hk',la:22.2767,ln:114.1745,r:4.3,rv:'米其林一星烧鹅，皮脆多汁。在湾仔，从中环坐港铁一站。排队长。'},
  taicheong:{n:'泰昌饼家（中环）',c:'hk',la:22.2817,ln:114.1547,r:4.2,rv:'香港有名的蛋挞，外带为主，就在大馆附近。'},
  mido:{n:'美都餐室（油麻地）',c:'hk',la:22.3098,ln:114.1705,r:4.1,rv:'1950年代的老茶餐厅，怀旧装修，焗猪扒饭出名。离佐敦一站。'},
  manji_hk:{n:'满记甜品（尖沙咀）',c:'hk',la:22.2985,ln:114.1725,r:4.0,rv:'连锁港式甜品，座位多，4个人比较容易坐在一起。'},
  lordstow:{n:'安德鲁饼店（威尼斯人分店）',c:'mo',la:22.1477,ln:113.5602,r:4.4,rv:'澳门葡挞的元祖，路环总店最出名。威尼斯人里也有分店，下午逛的时候买更顺路。'},
  chankongkei:{n:'陈光记饭店',c:'mo',la:22.1928,ln:113.5402,r:4.0,rv:'烧鹅饭、黑椒烧鹅是招牌，平价、上菜快。'},
  hangheung:{n:'杏香园西点',c:'mo',la:22.1938,ln:113.5394,r:4.1,rv:'芒果西米捞、雪糕糯米糍出名，价格亲民。'},
  mokyikei:{n:'莫义记（官也街）',c:'mo',la:22.1536,ln:113.5581,r:4.2,rv:'榴莲雪糕、芒果雪糕出名，适合边走边吃。'},
  antonio:{n:'安东尼奥葡国餐厅（氹仔）',c:'mo',la:22.1542,ln:113.5575,r:4.4,rv:'米其林推荐，火焰芝士、葡国鸡出名。人均较高，要订位。'},
  huahui:{n:'华辉拉肠（文明路）',c:'gz',la:23.1225,ln:113.2760,r:4.2,rv:'广州人气拉肠老店，瘦肉蛋拉肠嫩滑，翻台快。'},
  baihua:{n:'百花甜品（文明路）',c:'gz',la:23.1222,ln:113.2766,r:4.3,rv:'老字号糖水店，芝麻糊、双皮奶、马蹄露好评多。'},
  huishijia:{n:'惠食佳（滨江西路）',c:'gz',la:23.1085,ln:113.2670,r:4.4,rv:'米其林一星，啫啫煲和烧鹅出名。人均较高，要订位。在珠江南岸，打车约10分钟。'},
  taotaoju:{n:'陶陶居（第十甫本店）',c:'gz',la:23.1180,ln:113.2485,r:4.3,rv:'百年茶楼，虾饺皇、叉烧包好评。装修古色古香，饭点要排队。'},
  lianxiang:{n:'莲香楼（第十甫）',c:'gz',la:23.1183,ln:113.2477,r:4.1,rv:'百年老字号，莲蓉包和传统点心。环境比较旧。'},
  panxi:{n:'泮溪酒家（荔湾湖）',c:'gz',la:23.1265,ln:113.2428,r:4.2,rv:'园林式酒家，点心种类多，环境好，适合拍照。'},
  wuzhanji:{n:'伍湛记（西关）',c:'gz',la:23.1215,ln:113.2455,r:4.1,rv:'艇仔粥、及第粥老字号，价格平。'}
});

// swappable meal choices, keyed by itinerary item id. The first option is the default.
function mo(pl,dish,cost,gal,cur,n){return {pl,dish,cost,gal,cur:cur||'CNY',n:n||''}}
const MEAL_OPTS={
  'd2-1':[mo('','广式肠粉 + 粥',30,'cheungfun','CNY','会展中心一带的肠粉店'),mo('','菠萝油 + 奶茶 + 炒蛋',35,'pineapplebun','CNY','会展中心一带的茶餐厅')],
  'd2-4':[mo('coco','粤菜 / 茶餐厅',80,'charsiu','CNY','COCO Park 一带'),mo('taier','酸菜鱼',80,'suancaiyu'),mo('runyuan','椰子鸡火锅',110,'coconutchicken')],
  'd2-9':[mo('sijiyelin_ns','招牌椰子鸡、竹笙',110,'coconutchicken'),mo('tanyu_sz','烤鱼（在福田 COCO Park，打车约25分钟）',90,null),mo('chenpp','潮汕卤鹅、蚝烙',110,'braisedgoose')],
  'd2-11':[mo('','双皮奶、杨枝甘露',25,'doubleskin','CNY','海岸城一带的糖水铺'),mo('manji_sz','杨枝甘露、芒果班戟',35,'mangosago')],
  'd3-7':[mo('yatlok','烧鹅濑粉',120,'roastgoose','HKD'),mo('maks','鲜虾云吞面',75,'wonton','HKD'),mo('tsimchai','云吞面、鲮鱼球',60,'wonton','HKD'),mo('kampai','烧鹅饭',150,'roastgoose','HKD')],
  'd3-8':[mo('tsuiwah_central','奶茶 + 菠萝油',60,['milktea','pineapplebun'],'HKD'),mo('taicheong','蛋挞',25,'eggtart','HKD')],
  'd3-12':[mo('ausmilk','炒蛋多士、炖奶',70,'adc','HKD'),mo('mido','焗猪扒饭、奶茶',90,'porkchoprice','HKD')],
  'd3-13':[mo('kaikai','杨枝甘露、芝麻糊',40,['mangosago','sesame'],'HKD'),mo('manji_hk','芒果班戟、杨枝甘露',55,'mangosago','HKD')],
  'd4-11':[mo('wanzai','海鲜代加工',150,'seafood'),mo('gongbei','生蚝、炒粉、宵夜',90,'oyster','CNY','拱北口岸一带大排档')],
  'd5-5':[mo('margaret','葡挞',24,'nata','MOP'),mo('lordstow','安德鲁葡挞（下午在威尼斯人买）',24,'nata','MOP')],
  'd5-9':[mo('wongchikei','虾子捞面、云吞面',90,'wonton','MOP'),mo('chankongkei','烧鹅饭、叉烧',70,'roastgoose','MOP')],
  'd5-10':[mo('yeeshun','双皮奶、姜汁撞奶',40,['doubleskin','gingermilk'],'MOP'),mo('hangheung','芒果西米捞',45,'mangosago','MOP')],
  'd5-13':[mo('taileilok','猪扒包',45,'porkchopbun','MOP'),mo('mokyikei','榴莲雪糕、芒果雪糕',35,null,'MOP')],
  'd5-17':[mo('santos','葡国鸡、马介休球',200,['galinha','bacalhau'],'MOP'),mo('antonio','葡国菜、火焰芝士',400,'macfood','MOP'),mo('venetian','各式快餐',100,null,'MOP','威尼斯人美食广场')],
  'd7-4':[mo('yinji','鲜虾肠粉、瘦肉蛋肠',30,'cheungfun'),mo('huahui','瘦肉蛋拉肠',25,'cheungfun')],
  'd7-5':[mo('nanxin','双皮奶、姜撞奶',25,['doubleskin','gingermilk']),mo('baihua','芝麻糊、双皮奶',25,['sesame','doubleskin'])],
  'd7-9':[mo('chiji','鲜虾云吞面',50,'wonton'),mo('huishijia','啫啫煲、烧鹅',150,'claypot'),mo('taotaoju','粤菜晚市',120,'taotaoju')],
  'd8-1':[mo('diandude','虾饺、金莎红米肠',90,'dimsum'),mo('taotaoju','虾饺皇、叉烧包',100,['taotaoju','charsiubao']),mo('panxi','园林早茶点心',110,'panxi'),mo('lianxiang','莲蓉包、点心',90,'charsiubao')],
  'd8-4':[mo('chentianji','鱼皮、艇仔粥',45,'congee'),mo('wuzhanji','艇仔粥、及第粥',35,'congee')],
  'd8-8':[mo('bingsheng','黑叉烧、烧鹅',180,['charsiu','roastgoose']),mo('huishijia','啫啫煲、烧鹅',150,'claypot'),mo('gzjj','粤菜晚市',140,'roastgoose')],
  'd9-1':[mo('gzjj','早茶点心',110,['dimsum','charsiubao']),mo('taotaoju','虾饺皇、叉烧包',100,'taotaoju'),mo('diandude','虾饺、金莎红米肠',90,'dimsum')]
};
// place -> photo set, for place cards on the map and timeline
const PLACE_GAL={szbay:null};
Object.values(MEAL_OPTS).forEach(list=>list.forEach(o=>{if(o.pl&&o.gal&&!PLACE_GAL[o.pl])PLACE_GAL[o.pl]=o.gal}));
Object.assign(PLACE_GAL,{souvenir:['almond','bakkwa'],ladies:['eggwaffle','fishball']});
// photos of sights (Wikimedia Commons, see CREDITS.md)
Object.assign(GALLERY,{"nantou":[{"f":"img/nantou-1.jpg","a":"Iswzo","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:%E5%8D%97%E5%A4%B4%E5%8F%A4%E5%9F%8E%E5%8D%97%E9%97%A82022.jpg"},{"f":"img/nantou-2.jpg","a":"Mx. Granger","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:%E5%8D%97%E5%A4%B4%E5%8F%A4%E5%9F%8E%E5%8D%9A%E7%89%A9%E9%A6%86.jpg"}],"mixc":[{"f":"img/mixc-1.jpg","a":"Charlie fong","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Huarun_Wanxiang_World_in_Nanshan2021.jpg"},{"f":"img/mixc-2.jpg","a":"Jasper201434","l":"CC BY 4.0","p":"https://commons.wikimedia.org/wiki/File:MIXC_WORLD_East_mall_atrium_in_March_2024.jpg"},{"f":"img/mixc-3.jpg","a":"Jasper201434","l":"CC BY 4.0","p":"https://commons.wikimedia.org/wiki/File:MIXC_WORLD_West_mall_atrium_in_March_2024.jpg"}],"haixin":[{"f":"img/haixin-1.jpg","a":"Shujianyang","l":"CC0","p":"https://commons.wikimedia.org/wiki/File:Hai_Xin_Bridge_of_Guangzhou_01.jpg"},{"f":"img/haixin-2.jpg","a":"Nissangeniss","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Haixin_Bridge_(20210630).jpg"},{"f":"img/haixin-3.jpg","a":"Shujianyang","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Haixin_Bridge_on_Pearl_River.jpg"}],"yanjiang":[{"f":"img/yanjiang-1.jpg","a":"钉钉","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Yanjiang_Road,_Guangzhou_1.jpg"},{"f":"img/yanjiang-2.jpg","a":"Zhangzhugang","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Guangzhou_Haizhu_Qiao_2014.01.23_18-06-27.jpg"},{"f":"img/yanjiang-3.jpg","a":"钉钉","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Haizhu_Bridge,_Guangzhou.jpg"}],"zumiao":[{"f":"img/zumiao-1.jpg","a":"Zhangzhugang","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:Foshan_Zu_Miao_2012.11.20_15-41-28.jpg"},{"f":"img/zumiao-2.jpg","a":"Eduardo M. C.","l":"CC BY 2.0","p":"https://commons.wikimedia.org/wiki/File:Dragon_Performance,_Ancestral_Temple,_Foshan_(5929126412).jpg"},{"f":"img/zumiao-3.jpg","a":"钉钉","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Foshan_Ancestral_Temple_12.jpg"},{"f":"img/zumiao-4.jpg","a":"钉钉","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:Foshan_Ancestral_Temple_1.jpg"}],"lingnan":[{"f":"img/lingnan-1.jpg","a":"PÑēüḾôňïę1357","l":"CC BY-SA 4.0","p":"https://commons.wikimedia.org/wiki/File:%E4%BD%9B%E5%B1%B1%E4%B8%9C%E5%8D%8E%E9%87%8C%E5%85%A5%E5%8F%A3_2025.jpg"},{"f":"img/lingnan-2.jpg","a":"Haier7917","l":"CC BY-SA 3.0","p":"https://commons.wikimedia.org/wiki/File:%E4%BD%9B%E5%B1%B1%E4%B8%9C%E5%8D%8E%E9%87%8C.JPG"}]});
Object.assign(PLACE_GAL,{nantou:'nantou',mixc:'mixc',haixin:'haixin',yanjiang:'yanjiang',zumiao:'zumiao',lingnan:'lingnan'});

/* ---------------- default itinerary ---------------- */
function it(t,kind,title,place,cost,cur,note,book,per){return {t,kind,title,place:place||'',cost:cost||0,cur:cur||'CNY',per:per||'p',note:note||'',book:book||''}}
const DEFAULT_DAYS=[
 {date:'2026-10-09',title:'深夜抵达深圳',cities:['sz'],stay:'sz',items:[
  it('23:55','move','飞机抵达宝安机场 T3','szx',0),
  it('24:20','move','入境、取行李，开通 eSIM，测试支付宝','szx',0,'CNY','深夜入境人少，大约20–40分钟。'),
  it('24:50','move','滴滴 / 的士 → 宝安橙果酒店（约15–20分钟）','H:sz',80,'CNY','这个时间地铁已经停运。酒店在宝安中心，离机场很近。4个人带行李，用滴滴叫6座车或叫2辆的士。','','g'),
  it('25:30','hotel','酒店入住，休息','H:sz',0,'CNY','订房时备注“凌晨1–2点才到”，免得房间被取消。酒店24小时前台。')
 ]},
 {date:'2026-10-10',title:'深圳市区 · 深圳湾',cities:['sz'],stay:'sz',items:[
  it('09:45','food','早午餐：广式肠粉 + 粥（会展中心一带）','',30,'CNY','到了福田再吃。前一晚睡得晚，早上睡饱再出发。'),
  it('10:45','sight','莲花山公园登顶','lianhua',0,'CNY','山顶俯瞰福田中心区，约1.5小时。'),
  it('12:15','sight','市民中心 · 深圳图书馆','civic',0),
  it('13:15','food','午餐：COCO Park 一带','coco',80,'CNY','粤菜、茶餐厅选择多。'),
  it('14:30','shop','华强北电子市场','hqb',0,'CNY','逛1小时左右，15:30打车去南头古城。买电子产品另算预算。'),
  Object.assign(it('16:10','sight','南头古城','nantou',0,'CNY','从华强北打车约30分钟。城门、窄巷、文创小店和小吃，免费。边走边吃，晚餐别吃太饱。'),{id:'d2-x1'}),
  it('17:30','move','的士 → 深圳湾公园（约15分钟）','szbay',30,'CNY','4个人一辆的士。','','g'),
  it('17:50','sight','深圳湾公园看日落','szbay',0,'CNY','日落大约18:00，对岸就是香港。'),
  it('19:00','food','晚餐：椰子鸡火锅（万象天地）','sijiyelin_ns',110,'CNY','就在万象天地里，吃完直接逛街区。周六饭点要排队，先在小程序取号。'),
  it('20:45','show','人才公园夜景 · 春笋大楼灯光秀','talent',0,'CNY','从万象天地打车约10分钟。周六晚上一般有灯光秀，以当天公告为准。'),
  it('21:30','sweet','糖水：双皮奶、杨枝甘露（海岸城一带）','',25),
  it('22:00','rest','的士回宝安酒店（约20分钟），准备护照、港币或支付宝HK','H:sz',45,'CNY','4个人一辆的士。明天约8:45出门去香港。','','g'),
  Object.assign(it('09:00','move','地铁 翻身 → 福田（约40分钟）','futian_st',6,'CNY','翻身站在酒店附近（步行约10分钟），按高德地图导航换乘。'),{id:'d2-x4'}),
  Object.assign(it('18:45','move','的士 → 深圳万象天地（约10分钟）','mixc',25,'CNY','4个人一辆的士。','','g'),{id:'d2-x2'}),
  Object.assign(it('20:00','shop','深圳万象天地 · 街区夜逛','mixc',0,'CNY','开放式街区，小巷里有设计店和咖啡馆，晚上灯光好看。'),{id:'d2-x3'})
 ]},
 {date:'2026-10-11',title:'香港一日游（维港夜景）',cities:['hk','sz'],stay:'sz',items:[
  Object.assign(it('08:45','move','地铁 翻身 → 福田站（约45分钟）','futian_st',7,'CNY','这个时间地铁已经开了，不用打车。翻身站在酒店附近（步行约10分钟），按高德导航换乘。','','p'),{id:'d3-x1'}),
  Object.assign(it('09:30','food','早餐：福田站附近（包点、便利店）','futian_st',20,'CNY','买了边走边吃，9:40前进站过关。','','p'),{id:'d3-1'}),
  Object.assign(it('10:00','move','高铁 福田 → 香港西九龙（约15分钟）','wkl',75,'CNY','出入境都在站内完成，预留30分钟过关。买10:00左右的车次。','12306 App（护照注册），约提前15天开售','p'),{id:'d3-2'}),
  Object.assign(it('10:45','move','港铁 柯士甸 → 中环（约15分钟）','taikwun',15,'HKD','用八达通或支付宝HK乘车。','','p'),{id:'d3-3'}),
  Object.assign(it('11:00','sight','半山扶梯 · 石板街 · 大馆','taikwun',0,'HKD','大馆免费参观。','','p'),{id:'d3-6'}),
  Object.assign(it('12:30','food','午餐：一乐烧鹅（烧鹅濑粉）','yatlok',120,'HKD','米其林推荐，店小要拼桌。','','p'),{id:'d3-7'}),
  Object.assign(it('13:30','sweet','翠华：奶茶 + 菠萝油','tsuiwah_central',60,'HKD','兰芳园周日休息，所以改去翠华。','','p'),{id:'d3-8'}),
  Object.assign(it('14:15','sight','PMQ 元创方 · 文武庙','pmq',0,'HKD','','','p'),{id:'d3-9'}),
  Object.assign(it('15:15','move','天星小轮 中环 → 尖沙咀','starferry',6,'HKD','坐上层，维港景色最好。','','p'),{id:'d3-10'}),
  Object.assign(it('15:45','shop','1881 Heritage · 钟楼 · 海港城','h1881',0,'HKD','','','p'),{id:'d3-11'}),
  Object.assign(it('17:00','food','晚餐：澳洲牛奶公司（炒蛋多士、炖奶）','ausmilk',70,'HKD','早点吃人少。节奏很快，吃完就走。逢周四休息，周日营业。','','p'),{id:'d3-12'}),
  Object.assign(it('17:45','sweet','甜品：佳佳甜品（杨枝甘露、芝麻糊）','kaikai',40,'HKD','吃完走去天星码头约15分钟。','','p'),{id:'d3-13'}),
  Object.assign(it('18:30','move','天星小轮 尖沙咀 → 中环（看维港亮灯）','starferry',6,'HKD','天刚黑，坐上层看两岸亮灯。下船走到花园道缆车站约15分钟。','','p'),{id:'d3-y1'}),
  Object.assign(it('19:00','sight','山顶缆车上山（看夜景）','peaktram',168,'HKD','缆车往返 + 摩天台套票（估价）。周日晚上排队可能要30–60分钟，先在网上买好电子票。排太久可以改坐15号巴士或打车上山。','山顶缆车官网 / Klook，买电子票','p'),{id:'d3-4'}),
  Object.assign(it('19:30','sight','凌霄阁 · 摩天台看维港夜景','peak',0,'HKD','套票已含摩天台。20:00的幻彩咏香江灯光秀从山顶也能看到一部分。','','p'),{id:'d3-5'}),
  Object.assign(it('20:45','move','下山（缆车或15号巴士），港铁 中环 → 柯士甸，步行到西九龙站','wkl',15,'HKD','最好21:30前到西九龙，留时间过关。','','p'),{id:'d3-17'}),
  Object.assign(it('21:50','move','高铁 西九龙 → 福田','futian_st',75,'CNY','⚠ 周日晚上回深圳的人很多，末班时间以12306为准。赶不上就坐东铁线到罗湖过关（开到午夜）。','12306，开售当天就买，周日晚上最抢手','p'),{id:'d3-18'}),
  Object.assign(it('22:30','rest','回宝安酒店（地铁约45分钟，太晚就打车约¥70）','H:sz',10,'CNY','地铁末班车时间以当天为准；打车的话4个人一辆。','','p'),{id:'d3-19'})
 ]},
 {date:'2026-10-12',title:'深圳 → 珠海',cities:['sz','zh'],stay:'zh',items:[
  it('08:30','food','早餐，退房','H:sz',25,'CNY','酒店有自助早餐（订单不含的话约¥15/人）。'),
  it('09:15','move','的士 → 蛇口海上世界（约25分钟，带行李）','seaworld',60,'CNY','带着行李，打车比地铁方便。4个人一辆的士。','','g'),
  it('10:00','sight','海上世界：明华轮 · 海边步道','seaworld',0),
  it('11:15','food','简单午餐（码头附近）','shekou',45),
  it('12:00','move','滴滴包车 蛇口 → 珠海拱北酒店（走深中通道，约1.5小时）','H:zh',500,'CNY','叫6座车，行李直接放车上，门到门。价格是估算（约¥400–600一车，含过路费），以滴滴App报价为准。','滴滴 App 提前1天预约6座车','g'),
  it('13:30','rest','到拱北酒店，先寄存行李','H:zh',0,'CNY','14:00后才能入住，先寄存行李去喝下午茶。'),
  it('14:00','sweet','下午茶：拱北口岸广场一带','gongbei',35),
  it('15:00','sight','骑共享单车走情侣路 · 珠海渔女','fisher',5),
  it('16:15','sight','日月贝（珠海大剧院）','opera',0),
  it('17:15','sight','野狸岛看日落','yeli',0),
  it('18:30','food','晚餐：湾仔海鲜街（买海鲜请店家加工）','wanzai',150,'CNY','先问清加工费，按斤称价，称的时候看秤。'),
  it('20:30','rest','回酒店，准备澳门的护照和港币','H:zh',0)
 ]},
 {date:'2026-10-13',title:'澳门一日游',cities:['mo','zh'],stay:'zh',items:[
  it('08:30','food','早餐（酒店附近）','H:zh',25),
  it('09:00','move','拱北口岸步行过关 → 澳门关闸','bordergate',0,'MOP','平日约20–30分钟。'),
  it('09:30','move','巴士 → 新马路','senado',6,'MOP','澳门巴士收港币或澳门币，也可用澳门通。'),
  it('09:45','sight','议事亭前地 · 仁慈堂 · 玫瑰堂','senado',0,'MOP'),
  it('10:15','sweet','玛嘉烈蛋挞（葡挞）','margaret',24,'MOP','两个刚出炉的葡挞。'),
  it('10:40','shop','手信街试吃（杏仁饼、猪肉脯）','souvenir',0,'MOP','手信预算算在杂费里。'),
  it('11:00','sight','大三巴牌坊 · 哪咤庙','ruins',0,'MOP'),
  it('11:30','sight','大炮台 · 澳门博物馆','fortaleza',15,'MOP','博物馆周一休馆，这天是周二。'),
  it('12:30','food','午餐：黄枝记（虾子捞面、云吞面）','wongchikei',90,'MOP'),
  it('13:15','sweet','甜品：义顺牛奶公司 双皮奶','yeeshun',40,'MOP'),
  it('13:40','sight','恋爱巷 · 疯堂斜巷拍照','lovelane',0,'MOP'),
  it('14:15','move','巴士 → 氹仔','taipa',6,'MOP'),
  it('14:45','food','大利来记 猪扒包（约3点出炉）','taileilok',45,'MOP'),
  it('15:30','sight','官也街 · 龙环葡韵','taipa',0,'MOP'),
  it('16:30','sight','威尼斯人：室内运河','venetian',0,'MOP','贡多拉船约 MOP 150/人，可选。'),
  it('17:45','sight','巴黎人铁塔观景台，看日落','parisian',150,'MOP','','Klook / 官网，买当天傍晚时段'),
  it('18:45','food','晚餐：山度士葡式餐厅（葡国鸡、马介休球）','santos',200,'MOP','份量大，建议提前订位。','电话或 Google 地图订位（可选）'),
  it('20:15','show','永利皇宫 观光缆车 · 音乐喷泉','wynnpalace',0,'MOP','缆车免费。'),
  it('21:15','move','赌场免费接驳巴士 → 关闸，过关回珠海','bordergate',0,'MOP','拱北口岸大约开到凌晨1点。'),
  it('21:45','rest','回酒店','H:zh',0)
 ]},
 {date:'2026-10-14',title:'长隆海洋王国',cities:['zh'],stay:'zh',items:[
  it('08:00','food','早餐，带上防晒、雨衣、充电宝','H:zh',25),
  it('08:50','move','城际 珠海站 → 长隆站（约15–20分钟）','zh_st',8,'CNY','','12306'),
  it('09:30','move','到入口排队，打开长隆App看当天表演时间','chimelong',0),
  it('10:00','sight','进园先冲：鹦鹉过山车 / 飞越极限','chimelong',450,'CNY','门票（平日估价）。开园时排队最短。','长隆App / 小程序 / Klook / 携程，护照实名，提前1–3天'),
  it('11:00','sight','海洋奇观 · 鲸鲨馆','chimelong',0),
  it('11:45','food','午餐：园内餐厅（早点吃避开人潮）','chimelong',90),
  it('13:00','sight','企鹅馆 · 北极熊馆 · 海象馆','chimelong',0,'CNY','室内有冷气，适合中午。'),
  it('14:30','show','海豚 / 白鲸表演','chimelong',0,'CNY','提前15分钟入场。'),
  it('15:30','show','花车巡游','chimelong',0,'CNY','时间以当天公告为准。'),
  it('16:15','sweet','雪糕 / 饮料','chimelong',30),
  it('16:30','sight','海象山过山车等刺激项目','chimelong',0),
  it('17:30','show','海洋大马戏 / 晚场表演','chimelong',0),
  it('18:30','food','晚餐：园内餐厅','chimelong',90),
  it('19:30','show','烟花汇演 / 灯光秀（如有）','chimelong',0,'CNY','以长隆App为准。'),
  it('20:30','move','城际回珠海站，走回酒店','H:zh',8,'CNY','散场时的士难叫，坐城际最方便。'),
  it('21:15','rest','收拾行李','H:zh',0)
 ]},
 {date:'2026-10-15',title:'珠海 → 佛山（祖庙 · 岭南天地）',cities:['zh','fs'],stay:'fs',items:[
  Object.assign(it('08:30','food','早餐，退房','H:zh',25,'CNY','','','p'),{id:'d7-1'}),
  Object.assign(it('09:30','move','城际 珠海站 → 广州南站（约1小时10分钟）','gzsouth',72,'CNY','','12306','p'),{id:'d7-2'}),
  Object.assign(it('10:50','move','地铁 广州南 → 2号线 魁奇路，转广佛线 → 祖庙（约50分钟），到酒店寄存行李','H:fs',6,'CNY','广州南有通道直通佛山2号线，魁奇路站内换乘，不用出站。酒店在祖庙站旁边。14:00后入住，先寄存行李。嫌拖行李麻烦就在广州南叫6座滴滴，约¥80一车。','','p'),{id:'d7-3'}),
  Object.assign(it('12:00','food','午餐：佛山小吃（鱼腐、陈村粉、盲公饼）','lingnan',50,'CNY','祖庙、岭南天地一带小吃店多，从酒店走过去几分钟。','','p'),{id:'d8-x3'}),
  Object.assign(it('13:15','sight','佛山祖庙 · 黄飞鸿纪念馆 · 叶问堂','zumiao',20,'CNY','约2小时。黄飞鸿醒狮表演一般14:15、15:30有场次，以当天公告为准。','','p'),{id:'d8-x2'}),
  Object.assign(it('15:30','sight','岭南天地 · 骑楼老街','lingnan',0,'CNY','就在祖庙旁边，免费。','','p'),{id:'d8-x4'}),
  Object.assign(it('16:15','sight','梁园','liangyuan_fs',10,'CNY','岭南四大名园之一，人少安静。离岭南天地打车约5分钟，16:40停止入园。','','p'),{id:'d7-f2'}),
  Object.assign(it('18:00','food','晚餐：顺德杨廷记（盐焗鸡、鱼皮角）','yangtingji_fs',65,'CNY','在岭南天地钟楼旁，吃完直接夜游。有记、天海等其他选择在“换一家”里，有记要17:00前到。','','p'),{id:'d7-f3'}),
  Object.assign(it('19:30','show','岭南天地夜游','lingnan',0,'CNY','晚上亮灯后比白天好看，免费。','','p'),{id:'d7-f4'}),
  Object.assign(it('20:45','rest','走回酒店（约10分钟），办入住','H:fs',0,'CNY','','','p'),{id:'d7-f5'})
 ]},
 {date:'2026-10-16',title:'广州一日游（西关 · 珠江夜景）',cities:['gz'],stay:'fs',items:[
  Object.assign(it('08:15','move','地铁 祖庙 → 广佛线 → 西塱，转1号线 → 长寿路（约50分钟）','shangxiajiu',6,'CNY','祖庙站就在酒店旁边。','','p'),{id:'d8-x1'}),
  Object.assign(it('09:15','food','早茶：陶陶居（虾饺皇、叉烧包）','taotaoju',100,'CNY','在第十甫，长寿路站走过去约5分钟。周五早上也要排队，可先在小程序取号。','','p'),{id:'d8-1'}),
  Object.assign(it('10:45','sight','陈家祠','chenclan',10,'CNY','从陶陶居打车约10分钟。约1小时。','','p'),{id:'d8-2'}),
  Object.assign(it('12:00','sight','永庆坊 · 粤剧艺术博物馆','yongqing',0,'CNY','','','p'),{id:'d7-7'}),
  Object.assign(it('13:00','food','午餐：银记肠粉','yinji',30,'CNY','','','p'),{id:'d7-4'}),
  Object.assign(it('13:45','sweet','甜品：南信 双皮奶、姜撞奶','nanxin',25,'CNY','','','p'),{id:'d7-5'}),
  Object.assign(it('14:15','shop','上下九步行街 · 骑楼','shangxiajiu',0,'CNY','就在南信旁边。','','p'),{id:'d8-3'}),
  Object.assign(it('15:00','sight','沙面岛：欧陆建筑','shamian',0,'CNY','约1.5小时。','','p'),{id:'d7-6'}),
  Object.assign(it('16:45','sight','北京路 · 千年古道遗址','beijinglu',0,'CNY','从沙面坐地铁或打车约15分钟。','','p'),{id:'d8-5'}),
  Object.assign(it('17:45','food','晚餐：北京路 池记云吞面 + 小吃','chiji',50,'CNY','','','p'),{id:'d7-9'}),
  Object.assign(it('18:45','show','沿江路 · 海珠桥 · 长堤 夜景散步','yanjiang',0,'CNY','从北京路走约15分钟到天字码头，再沿江往海珠桥走。','','p'),{id:'d7-x1'}),
  Object.assign(it('19:45','move','地铁 海珠广场 → 广州塔 / 花城广场（约20分钟）','huacheng',5,'CNY','','','p'),{id:'d8-x6'}),
  Object.assign(it('20:15','show','花城广场 → 海心桥，看广州塔亮灯','haixin',0,'CNY','广州塔从外面看最漂亮，海心桥上拍照最好。免费。','','p'),{id:'d8-7'}),
  Object.assign(it('21:15','move','地铁回佛山：广州塔站3号线 → 沥滘，转广佛线 → 祖庙（约1小时10分钟）','H:fs',7,'CNY','末班：3号线要在22:40前上车。太累的话直接打车约40分钟，约¥80一车。','','p'),{id:'d8-x5'}),
  Object.assign(it('22:30','rest','回酒店，收拾行李','H:fs',0,'CNY','','','p'),{id:'d8-10'})
 ]},
 {date:'2026-10-17',title:'佛山 → 深圳 · 22:00 起飞',cities:['fs','sz'],stay:'',items:[
  Object.assign(it('08:00','food','早茶：金源酒家（手推车点心、千层糕）','jinyuan_fs',40,'CNY','佛山少数还有手推车点心的老茶楼，06:00开门。离酒店打车约5分钟。不想出门就吃酒店早餐（以订单为准）。','','p'),{id:'d9-1'}),
  Object.assign(it('09:30','sight','南风古灶（石湾）','nanfengguzao_fs',25,'CNY','500多年还在烧的龙窑，附近是石湾陶瓷老街，可以体验做陶。从祖庙打车约15分钟，约¥20一车。','','p'),{id:'d9-2'}),
  Object.assign(it('11:15','rest','买手信（盲公饼等），回酒店退房','H:fs',20,'CNY','12:00前退房。从南风古灶打车回祖庙约15分钟。','','g'),{id:'d9-3'}),
  Object.assign(it('12:20','move','的士 → 佛山西站（约25分钟）','foshanwest',45,'CNY','4个人带行李叫一辆6座车。提前40分钟到站，进站要安检。','','g'),{id:'d9-6'}),
  Object.assign(it('13:18','move','城际 佛山西 → 深圳机场（约1小时40分钟，直达）','szx',76,'CNY','深圳机场站就在T3下面，出站走过去就到。这条线一天只有几班，错过的话改走：地铁/打车到广州南 → 高铁到深圳北 → 打车到T3。','12306，提前买；车次和时间以12306为准','p'),{id:'d9-7'}),
  Object.assign(it('15:15','move','到机场 T3，先寄存行李','szx',30,'CNY','寄存在4楼1号门A岛，24小时，第一小时免费，之后按件按天收费（估价）。这样下午可以空手去玩。','','p'),{id:'d9-8'}),
  Object.assign(it('15:45','move','的士 → 宝安欢乐港湾（约20分钟）','joyharbour',40,'CNY','行李已经寄存，4个人一辆的士就够。','','g'),{id:'d9-9'}),
  Object.assign(it('16:10','sight','欢乐港湾海滨步道','joyharbour',0,'CNY','沿海边慢慢走，吹海风。','','p'),{id:'d9-10'}),
  Object.assign(it('16:50','sweet','海边找间咖啡坐坐','joyharbour',30,'CNY','歇一歇，等日落。','','p'),{id:'d9-x1'}),
  Object.assign(it('17:40','show','海边看日落','joyharbour',0,'CNY','日落大约18:00。','','p'),{id:'d9-12'}),
  Object.assign(it('18:05','food','最后一顿晚餐：欢乐港湾（潮汕菜 / 粤菜）','joyharbour',120,'CNY','','','p'),{id:'d9-13'}),
  Object.assign(it('19:00','move','的士 → 机场 T3','szx',40,'CNY','4个人一辆的士，在机场取行李。','','g'),{id:'d9-14'}),
  Object.assign(it('19:15','move','取行李，值机、托运、过安检','szx',0,'CNY','国际航班起飞前约3小时到机场。','','p'),{id:'d9-15'}),
  Object.assign(it('22:00','move','航班起飞，回马来西亚','szx',0,'CNY','','','p'),{id:'d9-16'})
 ]}
];
DEFAULT_DAYS.forEach((d,di)=>d.items.forEach((x,ii)=>{if(!x.id)x.id='d'+(di+1)+'-'+(ii+1)}));
const DEFAULT={
  v:1,
  settings:{people:4,rooms:2,myr:1/1.63,rates:{CNY:1,HKD:0.884764,MOP:0.855913},flight:1200,misc:500,hotel:{sz:'booked',zh:'zh1',gz:'gz1',fs:'booked'}},
  booked:{fs:{"n":"如家商旅酒店（佛山祖庙地铁站店）","addr":"佛山市禅城区祖庙路46号华辉大厦（首层前台，10–12楼客房），祖庙地铁站旁","phone":"0757-82030098","ref":"","cin":"2026-10-15","cout":"2026-10-17","amt":668,"cur":"MYR","link":"","note":"祖庙站旁边，去广州坐广佛线一程就到。部分房间没窗，入住时可以问能不能换有窗的。14:00后入住。","la":23.0277,"ln":113.111,"rooms":[],"prev":"fs1"},sz:{"n":"橙果酒店（深圳宝安中心翻身地铁站店）","addr":"深圳市宝安区翻身路81号（42区），地铁5号线翻身站B出口步行约10分钟","phone":"0755-33216699","ref":"","cin":"2026-10-09","cout":"2026-10-12","amt":911,"cur":"MYR","link":"","note":"14:00后入住，24小时前台，有自助早餐（以订单为准）。地图位置是大概位置。","la":22.5649,"ln":113.8904,"rooms":[],"prev":"sz1"}},
  days:DEFAULT_DAYS,bookings:{'hotel-sz':1791331200000,'hotel-fs':1791331200000},actual:{'hotel-sz':{amt:911,cur:'MYR',per:'g'},'hotel-fs':{amt:668,cur:'MYR',per:'g'}},rev:'default'
};


const COS=Math.cos(22.6*Math.PI/180);
// rough schematic coastline of the Pearl River estuary (lng,lat)
const WATER=[[113.60,22.80],[113.66,22.80],[113.76,22.72],[113.80,22.64],[113.86,22.57],[113.89,22.52],[113.90,22.48],[113.94,22.50],[114.00,22.52],[114.03,22.51],[114.00,22.47],[113.95,22.42],[113.93,22.38],[113.99,22.36],[114.06,22.35],[114.10,22.32],[114.155,22.297],[114.175,22.291],[114.19,22.300],[114.22,22.305],[114.26,22.29],[114.30,22.26],[114.36,22.22],[114.45,21.80],[113.20,21.80],[113.40,22.02],[113.50,22.06],[113.555,22.09],[113.568,22.115],[113.570,22.16],[113.556,22.19],[113.558,22.215],[113.575,22.24],[113.587,22.262],[113.588,22.285],[113.60,22.33],[113.625,22.42],[113.60,22.52],[113.62,22.62],[113.60,22.72]];
const ISLANDS=[
  [[114.12,22.285],[114.16,22.289],[114.20,22.287],[114.23,22.286],[114.26,22.27],[114.25,22.22],[114.20,22.20],[114.15,22.23],[114.12,22.26]],
  [[113.83,22.23],[113.88,22.28],[113.95,22.30],[114.03,22.32],[114.05,22.30],[114.02,22.25],[113.95,22.21],[113.87,22.20]],
  [[113.585,22.2765],[113.598,22.2765],[113.600,22.2825],[113.588,22.2835]]
];
const RIVER=[[113.63,22.80],[113.58,22.88],[113.50,22.96],[113.42,23.03],[113.36,23.08],[113.31,23.105],[113.27,23.115],[113.24,23.11],[113.20,23.10]];
const CITY_LABEL={fs:[113.05,23.07],gz:[113.38,23.17],sz:[114.12,22.62],hk:[114.20,22.40],mo:[113.47,22.17],zh:[113.46,22.30]};

