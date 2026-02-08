const router = require('express').Router();
const Sales_items = require('../../database/models/Sales_items');
const ApiError = require('../../error/ApiError');
const validateDto = require('../../middlewares/validate-dto');
const trackingSchema = require('../../dto/callbacks/tracking');
const Status = require('../../services/email/shipping/Status');
const Sales = require('../../database/models/Sales');

const tokens = [
  {
    token:
      'Su?UZeY?blTQzbtgFpnWFuzNFgdjEgy9RenBWr3ZrUEbQ46cjpNaDkeo-pmGZ!Y-rbidJ9uM-/QBf/jUPnx3YWZx!FVJVdZk2Go2oEEsV0CrftNTCf240zZ1=Gjs5mg2!CsQgqoxcjWTCSN7?Ujr=Dvhmo-69HvpCdXxhjV!M6wXV?T=i4GBTSKAZch7PymCJV3SKe!NQwbS6Rm6mqlZzmQKaBT?Y79kf/Pyc6BCs3646M/e!r84cOPPDoh/2Di2',
    id_user: 29866,
    email: 'patryckhollister1@icloud.com',
  },
  {
    token:
      'yeNMXbgDge8Ohmvn5BaZzWAJI7ZG=H5Kw/VRAujd!NGGSRbJYb6GKc68?dPMsJrApB3v!SJVZ254qyx1tugcVzXKGpBr!Mo4baKJTmwglhfzZrBqk0umlZrnu-mv=FODMk?zelMj23xMZ5w/v1mrq9fZJ1QP=TBJt-kfcC-StB=sYSS-DvPsWcJCUviqNzJIWVJ8/hZ=W3NKm0zYBYzjxQFDasStMK02/J7KNf/KTF1MDsbws8f7KaqazaRPg4O1',
    id_user: 35523,
    email: 'agteodoro.mkt@gmail.com',
  },
  {
    token:
      'wcB-b3x=4GE7ECJ?sI=/id6R9TgmolhXg/yprSFGXo!GhKVPxExIPXrzJJVEOFv5epnnT!D9tTTo3lUMfnZLqR0?Y5XXY!M=jtvv!YZUu4vpYSNANbrY8piFEjMs1i/xkePhbr7n!n/jFk8AQTY93L4dG?T=AVPQyp?/qC1S=P6tzr7mm4XIUEnMi4b18/rtRGqQHeo3HnY-aT-BXHVwi9l2JQ!cgOu90a4Qr0okcMENyJXFOaJnF?hgvB90AG?H',
    id_user: 35526,
    email: 'rodrigo.contatosolar@gmail.com',
  },
  {
    token:
      'IfvihqnNPCtM!bre7?JitkdNfPDelwqdsJf9Od-kRaYuIOPQGStXafSqpAF81gZF2xByHaPXZVUdQRi1vFY1RJ!=FRf!AhT?KC75OGsJaJF0g6!W/wBXGLjo15RfvT!kxWQh9JsH9!DkYJZmOUGIMgtPG4-HhEa7/jYtvU02UBfvoRXezeG1TjqclsIpsIM7KosgEr2nkGKvlSKV56GxOilhAt=y1Ye4OOzg1or34-eTgVcEve9gZ1HAbvJH?W9W',
    id_user: 47,
    email: 'vinixp.vp@gmail.com',
  },
  {
    token:
      'Zy8VkTpQMNhA!dXo2?LrsfYwBZKJepvmtO6qF-UGCxIRNDLHsJX97QbaT513MgVFyWPdAZoKUEQYl0VFXRT!=JMu!PnK?O75dGCXaBF9p6!W/wTYNLjq24XfvR!kgRQh3LsH5!VmYKPzUOGIMgtXB4-HhEa7/jYtvU02WQbroRXFzeG1TjqclsIpsIM7KpsgEr2nkGKvlXKV56GxOilhAt=y1Ye4OPzg1or34-eTgVcAve9gZ1HAbvJH?W9W',
    id_user: 84242,
    email: 'redesonhardigital@outlook.com.br',
  },
  {
    token:
      'GcqpP/4wgD?nD6HMRjMG/YsO-UWwfYZ2eTLs-sT?9W5KZKO!QxjoLbyslbOyLWIYg3VCahtgDAnfMSQk1x9D1CgIGpTY-PZ8==xMGC8x61V!IggZu5bB?q799Kvq?iSZd8ZWdPy90eOsQU3shJT=eOn1y9ga72RSSkDO5PcV=taRqgGKWVVwQo9Xm-kdkN90gA6lTMxRV1N5kpWAFHN=sQj4QhiFg4zVKzEvQLATaMEN6n4uUvjzNZOUXZCQ9uYR',
    id_user: 53581,
    email: 'wigocomercio@gmail.com',
  },
  {
    token:
      'RNZ0byu3Qxo/WGVgwPk6gQO/=EQ9-RVLy?IFxynm/fewrXmYxf03zJu9H!5WlPBt0b/0MHBHqkfv3!6p3wG3sg?IxF/OiWz8RnnAlGvQt/NQhWf8i80rhRrNgGZv6OP?VpKIgVjwMTl7z6A!Y-Ofm2wmpPRDoxZUOBdi5lR5do?!w!nfctHzkXQcbLBKmUcKBOzzidRHMPsZt57s?4jIpvp15wCyst/lIqPLqzXX1cIZ2G72q-R3lHMYmWyjsTEW',
    id_user: 35526,
    email: 'rodrigo.contatosolar@gmail.com',
  },
  {
    token:
      'gNeu0tX?vnWpxT0gc3197XlsHnete52MTt7xh!SEnGwSs!WhmfodWXufXmJ?ebdH9QGwz=LAqltHVGoMSBI3OCwGLrlLBbSaH3/xtlclG=n6pkfj!1uSvGlEo8BMQmXK!6rJpsQOvsRg1VQdZTIrvP6U8VipmD7hiX-fz2HIV3o-0dU-Dcf5mECGVf3Bn-rxZcYzFd!!O2q3FekGCDz6iWlQEcxg/lgrsWCP2exQyby=GnHTZvlH1Ebx7OqwTVT2',
    id_user: 177872,
    email: 'maradyas0517@gmail.com',
  },
  {
    token:
      'uviNee?2TSUfxHTnMDTXX7jRQQ884G!GeiAlfJeMlheDKPSccTKhjSkG-P4qwMT1n?OuWen!GOodDCQWjPm2PBleEi6AhGFM5BSXeZvniExEdbfkp4cYDoSq5/0zOFT=ijxF0rGe4rB6Mjgb3cNjPMSr24pPfX?yZ1j0xLnR?q81rkcEeaesZfCTnDS1QvmI0bRtsQt=1fnp47UH1BVDL68xIZmVfuKMjVYfMOeJPIL4PIfQtgcLNoGuYjzOF1LY',
    id_user: 96495,
    email: 'martinsluizee@gmail.com',
  },
  {
    token:
      'ohgl1xb0PXL114pQNUOBWleUhFQ5N5WNV5PfGjD0FtwSR13QzxvEYGS0wjG-M7!aTavvuhlcfRCZGagKspPtcX7iEwczl5fYCvrSUMG0R!tCwJh3DzA4MU9NXzcdC5C/g0Nn8OYetpo7ZpHapis0NvluNH-B-321s/Ii4bNyjG2eEBcNgPm2gb675E0fFm!UxpuX=8fI0xDtcGHqvy?HfccJt2CDdir7KDgThKIgA8U8Kcv9-FZ1M9cbp-0wzioo',
    id_user: 179984,
    email: 'derson.gabriel@gmail.com',
  },
  {
    token: '%4jV5r^pzY2^GR+TSSYj95MqiP4p+e%1xkjKo48zqRY=',
    id_user: 310769,
    email: 'cognionbr@gmail.com',
  },
  {
    token: 'dutC6W8Rm1R+xo$qSgmz7D9%CPFHM$PSs5HrqmnpzK0=',
    id_user: 368774,
    email: 'comercial@towerdigital.com.br',
  },
  {
    token: 'lb4jn9jkkZ1DCGmW+tyY0P$^/P4$jDiQ2kkF6//QRq0=',
    id_user: 123058,
    email: 'diretoria@sejaziva.com.br',
  },
  {
    token: 'G2zm6HuDC1RSfM82wffeP2yfG$5zZ$+$4tXxVZP47k@=',
    id_user: 373320,
    email: 'contato@meusuplementobrasil.com.br',
  },
  {
    token: '%Ghmhuom@0oStdya#iWNnuX%Vz6yaRhsWCJlWRadiS#=',
    id_user: 79282,
    email: 'priscila@franquiaforte.com.br',
  },
  {
    token: 'MBVNB$s3#^bl6%6w26xgmd4a$e7i/44B/lvPHpJqN$M=',
    id_user: 224290,
    email: 'sac@creacola.com.br',
  },
  {
    token: 'V@@^#Yrid0G/9/hQ%8F4yMwvR0DPZH6NzQ7lLKFgKvo=',
    id_user: 172546,
    email: 'digitalhustt@gmail.com',
  },
  {
    token: '@1oH33Wtya#7CM%9iBCrCJNujjklzMnx+ume5Yvy%i@=',
    id_user: 41112,
    email: 'contato@gruporegenera.com.br',
  },
  {
    token: 'jaC0fdHNDeGiYt9JDhVzxN7GNpB$qPv8R#NMpJaZKC$=',
    id_user: 326323,
    email: 'lbxsuplementos@gmail.com',
  },
  {
    token: 'dY+jkcsL+@+@Xf^#q2kJeTB$YkP04H+hNTL0M2^vCwg=',
    id_user: 235207,
    email: 'natiellyamaral@hotmail.com',
  },
  {
    token: '7zg5VszwnYcWkp8GbbyKcGi+LrfWHFuLX0L4klv#XJg=',
    id_user: 422879,
    email: 'memoneurocontas@gmail.com',
  },
  {
    token: 'bPmW7+e/GNmV1H6g^@Kc@+88BT25Q#xkFPNz3#BNWJM=',
    id_user: 379496,
    email: 'larissa_sena.s@hotmail.com',
  },
  {
    token: '#X6fdahDjdHfhc3YocjxvuH4lxm@8r+MhTFBntuBwVo=',
    id_user: 273993,
    email: 'mari_saraiva@yahoo.com.br',
  },
  {
    token: '$v23z6zdRyXYD0x6BiKu5lox/a$Yjzz@eWN^t1ta7N#=',
    id_user: 399776,
    email: 'andersonborgesdigital@gmail.com',
  },
  {
    token: '4g+o0/BK9S2YegVr6Hzagj#P18N78l$7XGv$dzQo%Po=',
    id_user: 84906,
    email: 'produtordiegoro@gmail.com',
  },
  {
    token: '@ev40e%7ZXtBC5au^VDbV/1WpSG+4+TGr1ZCDS11hF^=',
    id_user: 436980,
    email: 'fuegonutritionesuperfoods@gmail.com',
  },
  {
    token: 'vjW5NuRkSbymrpw@mi2eWqQ#m8#YVWpXdvevHJakipw=',
    id_user: 447830,
    email: 'useliberah@gmail.com',
  },
  {
    token: 'pY26wG0SjK5pYPudwR7QbunWNk$/K5gg2%7jF^VK8TY=',
    id_user: 458433,
    email: 'yglowoficial@gmail.com',
  },
  {
    token: 'r15^b/ut#1bz6fG0GnRaCSh+yFzD@l9nN4g#xg5jmp0=',
    id_user: 91436,
    email: 'adm@drinkdomy.com.br',
  },
  {
    token: 'Lfgk^L^bjSFWJS36j5H$2leGmfumw7S4PJbh8jWCV3w=',
    id_user: 134,
    email: 'diegobrito9423@gmail.com',
  },
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Sem token, sem acesso

  const tokenUser = tokens.find((t) => t.token === token);

  if (!tokenUser) return res.sendStatus(403); // Token inválido ou inexistente
  // eslint-disable-next-line
  console.log('token na req', tokenUser);

  req.id_user = tokenUser.id_user; // Supondo que o valor seja o usuário
  return next();
};

router.post(
  '/',
  authenticateToken,
  validateDto(trackingSchema),
  async (req, res, next) => {
    const {
      id_user,
      body: { sale_id, tracking_code, tracking_url, tracking_company, status },
    } = req;
    try {
      const saleItem = await Sales_items.findOne({
        nest: true,
        subQuery: false,
        where: {
          uuid: sale_id,
          '$commissions.id_user$': id_user,
          '$commissions.id_role$': 1,
        },
        attributes: ['id', 'id_sale', 'id_product'],
        include: [
          {
            association: 'commissions',
            attributes: ['id'],
          },
          {
            association: 'product',
            attributes: ['support_email', 'support_whatsapp'],
          },
        ],
      });

      if (!saleItem)
        return res.status(400).send({ error: 'sale item not found' });

      await Sales_items.update(
        {
          tracking_url,
          tracking_code,
          tracking_company,
          tracking_status: status,
        },
        {
          where: {
            id: saleItem.id,
          },
        },
      );

      if (status) {
        const sale = await Sales.findOne({
          raw: true,
          attributes: ['id', 'full_name', 'email'],
          where: {
            id: saleItem.id_sale,
          },
        });
        await new Status()[status]({
          tracking_url,
          tracking_company,
          tracking_code,
          full_name: sale.full_name,
          email: sale.email,
          support_email: saleItem.product.support_email,
          support_phone: saleItem.product.support_whatsapp,
        });
      }

      return res.sendStatus(204);
    } catch (error) {
      // eslint-disable-next-line
      console.log(error);
      return next(
        ApiError.internalServerError(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
          error,
        ),
      );
    }
  },
);

module.exports = router;
