import style from '../css/main.css'

import { BlueprintLoader } from './Blueprint'
import BlueprintSelector from './BlueprintSelector'
import Renderer from './Renderer'

document.addEventListener('DOMContentLoaded', async () => {
    const loader = new BlueprintLoader();
    let currentBook = null;

    const blueprintSelector = new BlueprintSelector((selectedId) => {
        const id = parseInt(selectedId, 10);
        const blueprint = currentBook['blueprints'].find((elem) => elem['index'] === id)['blueprint'];
        renderer.setBlueprint(blueprint, document.querySelector('#check-show-icons').checked);
    }, document.querySelector('#select-blueprint'));

    const renderer = new Renderer();
    document.body.appendChild(renderer.domElement);

    const loadBlueprintString = async (source) => {
        try {
            const book = await loader.decodeString(source, true);
            setBlueprintBook(book);
        }
        catch(e) {
            alert('Failed to decode string.\nThe blueprint is corrupted or using an unsupported version.');
        }
    };

    const setBlueprintBook = async (blueprintBook) => {
        currentBook = blueprintBook['blueprint_book'];

        const blueprintIdMap = {};
        for (const bp of currentBook['blueprints']) {
            const id = bp['index'];
            const name = bp['blueprint']['label'] || `untitled-${id}`;
            blueprintIdMap[id] = name;
        }
        blueprintSelector.setData(blueprintIdMap);
        blueprintSelector.select(currentBook['active_index']);
    }

    const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const update = () => {
        renderer.update();
    };

    const render = () => {
        renderer.render();
    };

    const animate = () => {
        requestAnimationFrame(animate);

        update();
        render();
    }

    onResize();
    animate();

    document.querySelector('#button-load-blueprint').addEventListener('click', () => {
        const result = prompt('Paste blueprint string here.');

        if (result !== null) {
            loadBlueprintString(result);
        }
    });

    document.querySelector('#check-show-icons').addEventListener('change', (e) => {
        renderer.setIconsVisible(e.target.checked);
    });

    document.addEventListener('dragenter', (e) => { e.preventDefault(); });
    document.addEventListener('dragover',  (e) => { e.preventDefault(); });
    document.addEventListener('dragleave', (e) => { e.preventDefault(); });
    document.addEventListener('drop', (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                loadBlueprintString(text);
            };
            reader.readAsText(files[0]);
        }
    });

    window.addEventListener('resize', () => {
        onResize();
    });

    const SAMPLE = '0eNrtfW1zGzez5X/R5/Du4B1I3bt/ZCvloiTaZoWmtBTlbPaW//uSlEQO5cH0OY0ZP3b2+ZJUIuk0gEY3Gpju0/99c7t5Xj3u1tv9ze//fbO+e9g+3fz+v/775mn9abvcHP/f/u/H1c3vN+v96svNbzfb5Zfjf22WtzfffrtZb+9X/+fmd/Ptt4G/+Lre7Z8P/+f8Ry+/sTC9v7TUX3a9v3Tqv/Tf/vjtZrXdr/fr1ctkT//x94ft85fb1e4wnctf73fL9afP+8XhX0fQx4enw189bI8SD0iL4H+7+fvwb5e/HYfzDseecW5Xy8PKDgGY/whvEP8RjmM8LPPT8adPj6vV/eLLw/3zZrVwx5UakOBkCT43SfCAhNAkIQASbJOEKEtwpUlCAiTEJgkZkOCaJBRAQtckwXSyCJvaRBhAhG8TAZi1bTNrA9i1abNrAxi2aTNsA1i2abNsA5h2m2UbwLTbLNsgpt0mQTbtNsO2smG3zcDKZt2mBCsbdds+srJJN9qClS260aCtbNCNXsnK9tzoWq1sz43ng5XtufGQs7I9N57UDjDoNot2skU3RkxONunGqM/JNt0YuTrZphujbyfbdOMNwkX0OhXs2G3KJf5aFgeBLga62qzu9rv13eLj8267vFsN3T0ueyRcz/5xd5j43X799QAuLkKhZMYpZPqOkukmkWkomd0kMi0j06VJZDpKpp9EpqdkmklkBkamzZPIjJTMMInMRMm0k8ik/JCZxA95yg+ZSfxQoPyQmcQPBcoPmUn8UKD80CRuKFBuaBIvFCgvNIkTCowTmkYi44KmWVbGAU2zdxj3M5GFMN5nGkcQGeczjb+LjO+Zxq1HxvVMc3pFxvVMc0hHxvVME4tExvVME3JFxvdME1lGxvlME0BHxvtMc0+IjPeZ5jqUGO8zza0vGfq6PXhLTpa/bvtBINcDWt79uVhvn1a7/eFHo5ftw/oPonkCLV+h/XZzv94dlHD6DT+EHQjsRGJHAjuKq9B7C3m+PQCe/nzo0+wbziBKJsbkxDEVAs1wq5c7AtuS2IbA7qRVyBZHc0lEI2zHRXLehCW5QGITltQ7wmqrQNiOMyJawtFsIedNWJTrSGzCvmyWVqF0mAc5fi+pe5BC2I4N4pgI27GOW71CWJL1JDZhSdaKq0DYjhHPy0LYjiHPtEJYkiHP4kJYkhHPy0LYjhFPOtMRx5EhjyPTETZlDAtOmJjp5IVwmBcpY07EdIT9JHlMhP0EdvkIa4osNmFNXl4Fwn6sjEbYD3msGYMbk3i2G4MbD2uXBjcdWT0GP44cO04P2WQcNUmDG1Fmx4fbkGzsBjcawJ0Z3GgKO2vcggwZfhhLWJB8uFnchOSD11jcagzrjS1uRJb1ShY/k+QgzFjcnOQA0VjcgiwbIFjsZcH6UfdhcUOSrwXG4rZj2VPX4bZjE4tNHEbihc043JLkS7BxxAHEnpQOtx358m8cbjuOPSsdbknyY41x+GHk2FPT4Rbl2LPJ4fYlP4AZj70seHv2IL/d3D1sty9DPL13m+M/Pu1Wq22/PGd9f/yc57798W1YLm5tnj1hPRH7ySesx23Ps2eix21PfmY2PtAfE/wwUOS/JlTqFhJVVdWpaiMuxrZ5+LR+2q/vFnefV0/7xePy6Wn9dbV43D18Xd9L3zDsSfjtcvdaIvednELVb6nm0su+eTeX3ep/Px/+LX3eeJnE6y9/+LjeHP7ipWzurfrvLGC9e9guHnbHb1t3D8/HkkLXHcx1aFRGNaqsHtXjZrnvjcvUxmVbNB9hzQdH1dXpNO9b5uLwuXAVfLq5RNV+MTPv4qQalZ19Fzf5rw7XfKEqK1Waj13DXFyC5xINVcOpm4vV7Jfex7dZdnEvk4cZVZx7F8cW/9W7WIiaD1RtrU7zsWUuBp9Loqp4dXPJmv1iy8y7uKh2cTf3Lk5c0bNKI8k07C6b4d2VLFVdrZuLa5lLwOfiVbvYz75fgmpcbl7rSpEqetdpPrVo3uKaz1R1vW4upWEuBr9BZtXtzsx+j8qq+52Z+daZLUV6oNJ8bvFfBr9BZk+xK+jmElrmgt8gs+p2Z2a+3WXV7c7MfrvLmSG90Cm+yX3hF8jSMewaqqmUltgIvz4W1dVu9jtUUd3tZr5wlqaHKVwlgSFW0W2ulmsdHrGURBC46CaiutPNfnkqhSCW6VTMNQ3PS/C13HaacMjOaoW2a3jq9vjMNQ7IzbyvbOcJPiHdvtJc4/LMGo8EyZFu1g1XuITvqYbnbTw4sZ3mRanMvXUBEr3GsN8CJHqNtyRrGpwPfrGwRuN9jJ/XDE1D+INfEK3ReCATZt+/kSER022uxLCI6URo4iXbzbyxGm5t+JuTtQ0hE/5MZ60qZjJz71+AKbDxCdwCXIGNXwysbfBB+CO7tRofZOO8ZmIbLm34xxJrNc9HNs2+fzNDHqjbXIVhD1SJcA0+CP+cap3GB7mZL26uIXbCP4tbp7q5zX51AygRG9M0LMCJ2JjVYl2DD8KTWqzT+CA38zXUaWInN/vFyjVET3jOlPUdQxqq2lzeMKyhOhEtj0f4/c1rfJCf+f7mG2InPEXUek3s5Ge/v/nIEMbqNleis84rQJnPOu+GkS7O4e559/UwicqAzAuMTde5+mGQTruj5zk8ul429fHvF69tUb6HeR91CdUENvAkQHa4FQrJVHj29seAWEuFZDmuwotttgkNOtrdNqFRx7vbJjTpiHfbhGYd826b0KKj3m0SSlEX9tL42oQaHflum1CrY99tE+p09LttQv0k2UGvY6gHD5EhkXmvxN6pYAfBL87mMOjVl9vNevtp8WV593m9Pc59LBfoVcRBwPrUsOvu4fFxtVvcLW83x2WXVtUPr2rSUKbY/H62cRA8T5IL8yptRGVFQ81yWs/BPhcER02pL8ngBujlG4MbIM2q/2QVlC+g+pvykT2sfYbX0LHqCgpmmfrG4q1/XuXjxt+xus88NU193QpPTQMqOE+RxCJu0cxavZ9V7wTTYiT1TtAuZlZVnme/qW6plvzchOudNXjTzat4gvPH1kObYc3nKfISxPAsFxUreVPoWToVLXmbTKPiJW+TaVXE5G0ynYqZvE2mV1GTt8kMKm7yNplRRU7eJjOp2MnbZGYVPXmbzKLiJ2+R6Tr61XP4SdF1fJ9mO9wQjGHF7D1NhuFj2XVOw1FuA/Ik6xiyzAuLBwoeNCzl9YWIGoLxOlzSsICjU88a+nIUvGg4xqsLQVBm9p9dq3BGwwQOTt1YDYU5Cu40POP1hfAaovE6XNAwjaNTjxqqcRQ8abjG6wuRNTThdbii4fIGp06QafaqrlFwo2EKry6EtRqq8Dqc0/B5o1NH6lXf2z/b8XWaetVX4dXrm7MMqTq9AZOGXPx7cDsInunHu/e+43yZf4kYH7bHRV7v7p7Xe+2V3tkyRZGmqDeC7HPB7m+C7HMRSa31Mv5ArfkfoDTnFBTj6Go2fSfDN0RQ8JqjSqOfzX6EzhLPO46qLE9QTyhrDD/7A6mwXmYeprD0AxRGsJqyEaSXKxm+OxPZ9uVOwSVejU8IblPDXlN8UHCJo9hRwSVeX4Wk4BKvo2UFlzg676JgAa+ONHQKFnBwpMEoWMBRbKtgAa+vglOwgNfRvIIFHJ13ULCA10caFSzg6Eg1vN0odlYwjNdXQcPUXUWLnYJTHJx3NArG7PpIrYLbGx2pUzBm10fqFdze6EgDmYTs5CRkFyP9HD/8iB4T/xw/HPPEzFB8W6uJTGKZhOL7+Lw0Gq8i9I+9bwCquSTTRvH9OolpyyRcsm0U3zONyk1C8C3r3TME30q9h0kIvuW5RIbgWzmXRipterdg5S4u5Tbi8Zl2cZmE4FvUfO4Ygm+d5rOZhOBbnotlCL6Vc3FtBN9z7eLs2yi+59nFTfSSvTuDqPnIEHwrNZ8mIfiW55IZgm/lXEobwfc8u6V0bQTfM41qGuptUe/FMjTiOr2Xaai35bl4hkZcOZfQRu89lycusY3ee6ZdPA31tqz5zNCIKzU/DfW2NBffdQyNuGouvjNt9N6z7BbfUTTaypmrIimjst/XrPR3Fhxqs1fFUsZN5VkO4/rt/Kv2/STeUuulSQSGPVypwqhKZPBIor7vEkGCrRy/6uqXfi49q0K5PL8VGYb5W6c/o8rIwLafsQS3tHL4Kg9of4DqdA7wp7ILo0r8APdGxNm6lVsj4bTYSgka3+d/LhWXFubp+cyHSDAN5M6zBqe11u0LgP2y8dS1roV1eUa1eYJ3WTn1QPAuK0XEKbiHxbuRivvShHmvLQDzZet9DWC+bLzeetc1MQ/Ps7TOTME8LG6rFuZL/JXCq5gvrZn56cgDzJeNr2behSlogeUFjgTBsXImqYl5eCYzyVMwD8vLW5qYh+eZO8B72fjdwgO8l42feXwL7yX+lcereC/d3B/DfQvzJf69zquYL52bef9GgndYubnSFKTA8vJmgt5YOZPSxDs8jwZDNwXBr7i8wTTRG89lu8ESvMM6rfdyk0fzE/2bFCNXZfjgp2AalrUWmpiGZ9qxsYkCeKZBpSnoj2WFwNy9R3/2mk16tZ3cIGyh010Hk1R97Ph012GziSB7r3/vlIXUXh8tPdfKCB0/124YyWMuYnE8C/8+fZAF3r2u2C7Hx+fteXyy78FzoxfH8BbHxVOlXWZwcb7r4xUMxy04ridwE25DjtFbwplhHKO3hNNhW0ZvCbcvy+jtilRSwKX0htubpfSG25ul9Ibbm6H0htubofSG25th9JZxezOM3jJub4bRW8btjVFbxs2N0VrGrY1SGmFsDCxsa5TGYEujxorHggwqbGXMLiiwjTFbtsAWRhlYgQ2M8gcFNjDKfRXYwChvW2ADow6HAhsYdZYV3MIolcEmRkUKBbYxJrAJOIcgE4cFnFGQCRtDB1sZE+WGDrYyJigPHWxljlIZbGWOUhlsZZ5SWeKeskxCQPknjU5+0ggd/6QxeDkPhn/SMHkYiaDmfFWLiddTTYO4FnsqWYTzU6ZJSG116DMJPt8+7Zen3x2q2RyfuNcQ5x3TDobhwiTVJSbV8CM2a5vGZ500/H71WedJ6lDqs26pELiUYlTxdRSC1eWwTSVGXh6u1dAp1ofbVEVk5OEyJmbk4QYNh2IdLk5SfVKfPWNqnTzcJlPr5OEWDaVkdbgtbX/7+LXhtuQxnVAlfIawM8nLwRB2RhlumuZU9dlPQ89Zx2cKTmS/65KG5bMO19RHSnbjrqnuzYr4vsn2ZL9OMN314WrL7a2m+qgO5ybpAlafvccisXIOxI4farfbl6D29JHeHP+xW92fPvC+4q8P/xVS15N4/D+5+G9/fBseR9B0IasvG2GSsr9rSZBZyN7Zt1io7P58i4HKUS3Bj7eQY/CgKZ6qo1lFd7M6mlP0M6uj+SkavNXV0kRyIcO3xJuy0w9JwfFbX+oWA5N9aGgwMBmdYMuT/SJBj7cA0CzfWq4O5iZoJldfRc+31KsPtSVdXR5qg2nJhhvTBHTJdfTM8zzXl5lgnRTB+jkfI4FOVMQ53r+Lc0IptTgnGb7FX31Olm/qVwdzEzT1q26M1HDayffnFkY6IEhOkSfDrq8z0UZQdsGp4WiTX32I3qHA1aipXajs4jNuWsAtPNspOjLWB9ty2sl+mGj3CTwh5KCgU6+jtdSCyvcRpk2nfB9paswp380yYWDyeVBaDEz2soUwMPm8KS0GJh84LaRiwANz8Qre/vpatASUsmcsUUHdXx9smqIatj5YTWeA+mALFPZZP8X7VuxcJe6LXTdFhWtt0WJnFC0PaosWe4kjx6/o28XT/uGxntlwWrR+EsJpCfe7h82H29Xn5df1w+5UzLPa3n/YP3w4Qd78/nG5eVodq0SW9x+O+I+r+7cf7XfPh5+c/uP8o9dP7gec/d+nZifHIqGb7+tIvuEKTN0pTP/t5m1b/H5zKkPZvIx3d0pB/HS6VvvSmRKdT9bF6JzrupTN8RPe7amYZXn8JV9y54o1hzjHGR9dtK7zMafKGmMf/t/qBqiNebh+XG/MZOy3Pw5z2a1W2/e/bfx3z7Q+VLexZ2tGTEZqRiKephPsWE5A7CXmjI4wuPoI/SAwmJqzOD4TnnDf0eCbQdTM577E4YkXtsQFoHaJRG7OeatGOScpEpk6vmNwLV3iguE6usQFw/V0iQuGG+gSFww30iUuGG6iS1ww3EyXuGC4hS5xgXBtR5e4YLiGLnHBcC1d4oLhOrrEBcP1dIkLhhvoEhcMN9IlLhhuYktcMNjMlrhgsIUtcYFgXceWuGCwhixxwVAtWeKCoTqyxAVD9WSJC4YayBIXDDWyJS4YbGJLXDDYzJa4YLCFLXGBYH3HlrhgsIYtccFgLVvigsE6tsQFg/VsiQsGG9gSFww2siUuGGxiS1ww2MyWuGCwhS1xgWBDx5a4YLCGLXHBYGl2iMqFN/DsEMYPI3m+bMTKZSOxl4MjlI1cnog99FwSqNZYx+9RNK1ODIlpwqSUkZnmSEoZhWnDo5MRO6Y9jlKGYVqxKGVcjPPx+cvjeOGIB17Nopukw8frbKq0PbGX31MbuOEGHsiu3P08f3vdl/v8GD8oqP859CDi83J7f9AUVl/hkA7jMSZV+j9E/hxjbusVYlpJuwc5u0+/+Wm13C3++rxabfq//sfgLAqt7vBOC2d1H46Q7dPjw26/uF1t9oNKT52qZADTSC/HCJ2LrW3d3fJ+Obxvk50m718g5Iq9vKSKZRfKsK8ykSB7MyP2NqyAltzbDPu8XlpSZWUStzLAge/bzpcEnPemUYR83DdK6OUxDa+7p5a9pRFlgDdLlk72yA3akT6m1DzM08GbbzYHFQx6mcxaayLPxpZmkAV2Yjlqkv48NoNEqsLY2sn19LA5nJiPy+3pxKyaxfAtKmdNzhk4R/Z47p3O7/bb8u7u+cvzIYZ42PFzVDWD7I2lvU3EYLRzkLvajP3qxVpXm8NCH4Kj48DXu7vn9f7yF3aYejNeNZtEjNAk8sQsknfqx4uAe2rJ/jIFdqpFunX0QnVo2Bdn9HjcrWP5U66SvNNL9jpiLPYPi0+7g37vx2j7UTUlaXxOHp8cAtjGG38B2mG0PVykXj6XtMrOckdS6iVzDa+yM1cOZRDDShhWxnD4OFwNw+Pr5LjdmIBmgi40qjlqhu+x4SccO7PYGcdO3FmceolGUHag/1dkB37cPK/vL+mBd7vn+9XiYb1h8gNjZ4cz4+SMwVNiYPcfJkV/2KbFRpNKziFHb8Nr5iCfM5gM7nQ863SuErIedstPB/jl9s8x8vFTZDWIZVGs93ECrJlaom0yDl+jQO58PFnr/OnCDw8y8J8uhh1ULx8Ly0osclJiMuyNYnEhWD9eX67C7fuvy+3dYVyXaPPsgw8x2P3zYSBfD9Kl0Dv1MrnQQbn5B0U/G146Osw2qF4OGTio3hkw26DoR8lL55b5BmXpQZn5ByWFXf1vMDUXbL0IYmWQIIIYGQQPofpfNiwU5zC0VL1yLAO5e6v7shHeiflxXzbY+/7wt5BEkWf5+qIOasx10p4q4pZyBt9SZmRLDWrdSTen3qt6dYCiCWcZo/fyubwdfYrvrq82FW8zHEC4gK9lJK3TxaaOzYz9LJ/3D19OMfni6W69OjjixeNh6171JxqypvO4gL+6KPXLerPeL3d/I3/V6zzyefVlfbfcIH/V08qrNrGZXVb8eX8cJDTEnhM9/Naq/ieD7sKpuFowF+yyhq8E9ERl3MDMJPbliYci0lN56Z3o2jcPQlgYouanPH7hCqSGvBTERHl0uHtjwwOPBzaJnXhSQGM+2WuCGmM1PvlgJ3erp6djSP287ccdVV/81+J+tX06ea397mBiz7uV6IsPQv5c7Rcfn/uxUMUDv2QzDEZMvRv51UewcSd7/TFp3LdKIV7vXXy5P6zq32Kg5lX0HNjuJmjdegkq2PYOePzW++4DYlscO5EON0hhnZHDuuA14wN1hjs727HYUfr008lzlz4fGTn2D1kahxFPvV5GqPiZrTaO2OEYtXFE3A7eXbRlO4i4HVg28IhO84kRHLefhCjBjH+5TRGntLFsYNDL6MRelXqM+d13tei9J6aXu/xhQVbbT0eo11NV98zUSwo943583m0PF4DRL30twXDMmq+m4KYsOLb8apU6zYc/bIv38jOBlZ/mmt/L1gRkpmlk4m7CFVLbVy0GRz8xycfBVVtB8HNVV8OK9CeiyuIl/hNRN4yU+SqUDqlCSb1Uy93D7cMx5XmkiUcZHF0vmXIMw41iGATDlFEMC2GEUQwHYZhRDOnZ77wHS4Np5vDdnaj6DFcqW73P4zY0Uj/JQBOwpHl0QTOA8FaDW4FA9vlbYewwREG2+Vu1agUC2eVvJaQVCEt/5K9pH++1d3Z0w+6peNrR5WEgTSv1xcWnJ+JlY7M8wd/WXhPs+zTOu+XtRn7LUHysIbjdenOFKI9SC9NbLyUgCbE4wfjWQ821jVm4jlqDmym38LX1Eg+EqWeCt62HWpl67qzKAuwvbQG5c6pZm1981kQ7qstcIbvPHdGM47J7QGzGX3Xijm/yUB1spoSHckkcdEtDDpfQQRuixvCSJ4tp0RiNzV2k/Jo2Z5h2IpFcUZUXc/EXX9GWJiiXpxHRFAiHdkGt2a9RpTW4X/zAYZptOvLAMYx/taJ+mvyrRTeVxTpKnHkQhwNNC7A6nI08KmoYMtNns34M2EFoB9BetA3eq4K762n8O4Pop84gylYu5OnadpFMl9O4TZMmq+Lfu/SX2qWZ73aVkQ9C2YIk9WnsIHH4F6vL98baEeo08f2lppKIcMYikcpevv76OR61EJ1vL8PHghaiC64jL8lOc+o5zTvOmTf/vJCusv1buui+j33rQRXRS/c6yBwE03hl5+ZdRqJDmiN3DZ4OJl9yWtru4hcz38B9gr+EED15XebW3BNOQHwY8iqzz7Pu1z4fKNCnInPtN67La431rtqn4ljzOfTr34aXMirKQFNNL3g6rhePVpxbNNix8x4nEz1/Nxvk0cwB4C4MZ18bNOFxAC65l5XTibCAiNAmwjGkmzoRnuHc1IkIDOWmTkRkGDd1IhJDuKkTkRm+TZ0IgJr0kkGpEoEwk9o260aISU2bdUfAuk2bdUfAuk2bdUfAutuMO4amiruIRxAX2rbLdW04gojEF793G3GIKORtXh8OP7w///HH9e4wYqFJ2MCt/0XIYVwv/Ffd8T+/PC53p4qO32/+8+YSzxzZSc7Ct6v9Xw+7P1/YSIZVIXuoNi8bZf/UuJkAJsU2g0iyc2q06iT7pkbXlGTX1Ohfk+yZGg+JJDumxpMuAVxNbcd1At5422IOgB+1MXAC6FEboz+AHbUxhM2yTTfG4Vm26cbLRKZ7FAxfrTLfosAPA73ru3j3+US8Vc3kPqvQQa8YWRU2XJ553BxEF0/Pm4/PO/ldPkuVab27RoWmLuckYlgRI7dQ3Zfrtaw/ZuWmr9sdKqall3SPoEYUY1pYxBMspomsHJ9NS7eDS4muKMZjmQdvDasc0TvW+/evbF2xtVe2MgnRuTjd+L7Y+2m9eRi7PbyjZnr9q0NYf/xgdPyE+mGzfN7efX4jE1RV0OVeevSYGtKbEgYx8gTk3+ICNrgMVEulJWPadLAU00RfQBxUTw+b9f07WoEKQXJRJV6/t/fpR9VCguxgjVyc0ZfV/fr5y+JcYPj4sFmNkX9XTtLSNbiVC8uXOHBNGt/7I2d6pakySfLco8pT8GmLGmnwUxY9PYvRcLjbuV2Ikch8rGg2xsLs3FUIorI/VO8YcRDaK/JToOtLMQTvRalC20Fo6XJxHVEPQkh3CydrViK9cLJmJc4LFyQIK1FeuChCiNTmSYQQmc2zCCESmxcRwiu+L2O7GW8l/fb44IeHGOnHBzsMxNMBl0okPhVJarFZT1H8bkzf01QphyRZWG8IFdqJIrNjXnZTFcPoiZJnWhqZU/MyhOq0RE7NS9FyFcPr6ZrnWhqRY/dSvVedlvgCdnnTrWKIL2CXpahiZPEVrYgY5fs84sfN8fPcWC3cO+VcCNQkpQzeyosXzfByyNQmIrIz9oZfxbDEYvjrxahwCL28qh5C3uXdqUGCcoFEY3SinxLZHXtpKFUMgr3WiS7GR02ZWBUtEcozhPL0WsvEal15HTm89wV/Qa+tGME52Hswt1BUFYhKe9eR2ISZXu427w+Uq1I/nYKDTB0v+hyCoLA3GYi1qfRyz+SFCpBJbE5x7cPxm9juoNbDeaxfPYapPnDmIVIfLqzo7HoJafLq2Tm3GUEQbx1nS7EjlGC57RcN3s+gpoRI2LopP3oLE8yMvdFhWzjKLSXECJGgXex93QN3TiQ0E2c0j5gIJURyC4shthEDr1g0zacxJfQyumQlOCzoOb+iLj7uHr4szuaiVlBi+kd4zkoS4x+6f9UCOGIHGHIHeHwB0r9q/oQbyuT0iSAicbafkqJVB7hr8dDC/6t0hvO7kiabFS0aMI31MtWkZf1XmULGa+MCZwkZdzKkjWX2GQ90tNetBHTveTkoOn2D044Kuv9aEJBxOhcjXtwz+xoPHv2TKKQoGhlgCim44xgJIwY9R8GfK0ZCyOFRs03v3gfLMyqr4PcXQ97AC06YZ8RHkkJYufhSXFi+ePBeOYlCCDdBvsgRtJ9W9EAFt3LLBbSm69h+mu8fX+bTz2FweIgBvqh9Xi2//j3Jc8RhdJouFBUdH9AcnCNTxyDSULgg+oAdFNkz0HlwwMZfN94/MdeenZ5vdweY7b5BvdKrpvjcfMAQG7pkGaPAWTpVDNPBGKaKIaa3GBnDKnpkgJuISO9yrJc00vNgr6NHde4XAzr6n93q48HDnr7jVjONvtvicSjd5Ih2+WKv3/ByOpjsxXr5YOOT9PZfNMms6duBuUg5Da2ICyjmoYl5NgcMsXdikDFwS+31R8csVUxR6zWvr45Pskgve2exBXSvJ0oVg+6JYitAdE+UrgKUYV/fVWdVYH9XxSA420YyBIYtzRnYVdXHZxWeoMN2uFN0B0Kn7nnDREcdULusL6p0hpyLV+sQGkKiDjvHxSSus8XXh1dIg6+Yqe9Ye684jhaasUsyqx0vLDiIIZh2z6hVt0lQi11aNxlMySqmsYsU+ysyWB9mHaboZyJvAxU/+Nlx2GnIM8MweeZABra0agTx93kS6D7UtH6pW0yZommLqF8mTe2MWh10ULVSOOc6/2y7JTA+0HO7Jbgpun3I+lU5R1d+Vo0ERceV+nZlcmQLqV+mxUAmsTUtXOqrUFRbJPNbBOfLeD0+v/vd4V0Ruyma0Ii2JKfcuf65N4xhYYyqwpjEOHftW8XrhpwY55w4R00iO7j1Y1SkfYMvihEnTqnPPcMYdf3K6eedNI7UwRjVcTCpZbZw+yyp2rtZhdO5e1hurk6iYR/CpJFZ0l8nr0jGBjdtCgps8IEzRTjRu76J5GRxL25motbDOnIjFnh81TnmTrWZ7WybORMFItZymzlbQhmmhj28mbOD07LryvCKtHHQ2HJQYIPGJlN/mSwZikz9ZbK4foSxmcQZW1aFmibOZiiFuP6ayBlKYTKzA2covbynx+cvj4O53pXNN8xE+3oDg4hoP26eT+WWb5o8521eEdAaG76joP2fN99w+q5cfIWr6zB/0VEYI230Ioa6RgzViljxLD6NFtnuRZ9XEp+oDbq8Iga04gWziEes5JRM1/Hp4pjfNZ3hoS0IbelkbMz+TefoBHJ0zJ4eswXHLH5uEneBZCpBRJAOyCgiSPYg72XJHCSDMmJ6TxERpKcM0ecYkaFJ9MDGSF5cdMCGYGIyntuvRtqvRtywYoqNcSKEtGONuGVFxiUj2o0pfC4z6HDEDBgj2oOYACNGvUZkYjKiTYlpLuLdxYhZLlZ6gDJikosVbcpKu9aKlm0TSt9Wn0jm022xyNyI6S7ild+I5EY2ShN0hs+wBV0XketCvgkZkbpIfBIyREqL5S6YxgWemA8MucRUFyt6CJGXSHyTNS7zWVbopil8si6oFpGDyIkeRaQgEt/VjbdoFlkdwqH8h1WzF6mCxA8sxgeUvLAOEVEKxTpEQskL6xAZpVCsQ8BJuFWIgF8u3314F20qGHR01S0XpF3rxZhApNLxRoQQ82/FjR/E+5+48UNEMxbrEAlNuK5rJKOjqEMUNDGxChE7MjHRVnAMm5joK0CW6L3oFa1MDiIc0XtRKcITvReVIgLRe1EpIhK9F5UiEtF7USkiE70XlSIK0XtRJyJ1RO9FpQhD9F5UirBE70WlCEf0XlSK8ETvRaWIQPReVIqIeO9FpQTAuN9sO+gkZM2nwDczIYjrXyuTXz96vRHcjvdhOgyP4JWKV4MSL0NAU7GFa1pb5vN/32SHwWTD79pGK5t943JocmA9v9M2D38t7lfbp2Nh4iGUer7bP+9qyf/2/f687qxQ3ZcEJYurbcvhq0qOcI9PnU/JCe7xqRSQ8R6fSgkF7/Gpk1A6vMenUoLBe3wqJVi8x6dSgsN7fColeLzHp1JCwHt8KiVEvMenUkLCe3wqJWS8x6dSQsF7fKok2K7De3wqJfQSn553Xw9/UnkJMCch6fo8CMOYbN9QXxmbu273WWv0GarnlR/G9ey7RawMMExRUBmF6gHb6Srp8hX+r1amaFUtwBbn169fddZ5iuJMeUsVrHemD69mP4hiuikqDcXBGl1toPm1d4JR1Tmcj7RfddaTFDfKW8pPUfcli9F1lI6/uA5V59X5s+GvOuvUsqU8vKVaDghnYTG60s5f3Of2MspGj0XXjR2Ltv+EePvw+LAb7E3x0hE5fxtPqz9E8KsPDx8/PBxm/jKcg8aGxVpIrHsVO4zhEIzj5hjB8BBGGMUIEIYZxYgtbciv3g1HDKWXr1YfaR4dZwYQjB2FKAhEHIPopaXVIWw3CoHse+tHISxkgK+2U7E/1xBD2Ix6SKd5G7ZF4SDXq93dkWv1lFnytPiy/LT8v+utWAn/abfaLu8rv9avWX3YrhZ/LTfAI7J1moDGdb/4pBscybsTcWw/NcQPePjgNB/PNAHpdRmdHf6CMUTrUFeDJiTRRJUvm+NIC/unXAhofcMlGL9JtHB34dcir7lzOoVPG1K8q66wgw4Fb89PlGidoO8/YB7/z0HYwQzfYq/T/3n/G+E4zt+Ojma11QDa978RU6lVK1oVQ5n3GnMdok2pfHg8iF1t3v+uHXS0H9e71XL3ZcB/25q2Gx5V8TelXhbr/eruiLa4e/hyu96e6k3rqX3pOybpoeD9FfJSE/s0UhT7db3bP5+c5dvynn5jsVrefX5XGPuuKPa/Dn/z8Lx/fFahPv794aSKD8ceKh/W2wPMze/73fOKqLQF7MX6fNT0jT1CDFrNEEjVIBKnt/BvvVX05r5XVPxOC79VNRbfezVRx66u1F7fpddFG9fq9bEp67Xv+r5b8eMns5vrk+lht3pZ6+dX9b35y+PwBYBXT1qDsBDEcjP4x27wj99V1d/tnu9Xl6r6dxD+pCh8m0TYMlm608pHtUDTnVbukoHvAP8WyZTrdogDbHO6PhU2aLhRE/ZZs5erj843zj5fT8w39+Y7jMZw+CURLSpYN1FdJAU5JoqdaT272fVMJD2eP8xVNRMZalErovF+oJt7vaJVsFGC+yM6Bccjis32nLtImG8tCa9wfg6o7xaG2TOKaIleLz/7ejEcoJ7cH4QfcKIfSIQfcJYbaaK9wnm8s2mmT224vB1JYs/XuV4VKZWUr16xxLCU6x2olUKc/KGmOjsMrfqqfr2ToUeR5fP+4cvptWnxdLdeHZS8eFz2HwUr7yPnUQF/dVHGl/VmvV/u/kb+aqC7MPBXvTLKV11iM7u4xOf9cZDQEHsR0OG3VvU/GX4GQipVzLA5gKmPvUqVQTswk5gB0d6vZgVxGFnzHG7+bQS/khH06UGHtqif4jwgan5srh6yww8vb5sAYge8fgQZ3gnX72rf0QT+583lcePD/uHDWf52tf/rYffn+aFsaB3YjrDn1XgXENT2sDIqIDpIu04KqTJ+LNsiggVyxWoh1NQrhsfwzvyTdzT+CjES6E++Dr2P71eTD5POnX0lqV28rkY7JAi/8si3T4JVVr58FvaKU7urvyVVDEvBnzJGXhsm32SXMc+1wwrul0eecCaf+HdfXGdcAfwwceJhUtjDpPZKN7AAQ+LYduO1R9RqptKwWNwlj7wLT75pRiYx2+bBb0bei5unUGVsxgB1bK5jeXKGP0S5jubJMV0FCaDSuPCvGs212HUAl0ZqFEG8DZ252bDWlK5TPQ6Zayn/vhj/3Bdj1xGv9F11B8VhbLk02Tfuf7k0udXCQH/4Wt9nHGJaBvaHPr+5sStYNwxrSDdb847G0n62snxG1dIHaxHvDOP9EgveUpJ8mUqNO86ZlqIKm2R84sP5hS8WXZyW2qmLtPrgWzpvXuh0q/iW+B52gQMXx7Z0B77wKNcHT3zyvrAoo4NnDNax4C3FotbLK0N8wL4QaKODbzJYIw++pezxQo1exye+Vl9o0tHFIT5XX8YKgruW6njbiSvjWgzWyK7Y2RZ8+ShxhM0a9pB1xCFr2EPWBU3vJxS8qWxRPqRck8HK3swRBmtYV+wYg2UPkZZKnt5UqivjmwzWyvjECXuBQxenhZhBDm28Il0EHjqTNspit1grsGVajFW2VabxPGuqvigeeUDs0HS0issSWgxVPriJJHA2oAlO8S6CYjeEwcCiNFxcAY02mKkcAxPZ3vROxy2UvRmEhtuqkRVKJHEbditGPGWFjdpjQ9Qr32aI3GzD6jM22KeRNzmRZk2HdbHFPOVTNOL2SQeNseFNCYimiYRqw8ZFqeEUBS4aCTdS+pKUGqzUyNFoagh2gZsvkRtNX3wTYabsvTe1mKn84JAagl3gvYRJxWUPpNRwllo5fMn4WWrZCCM3BLvA+2DGg136bTO3EP3Ivjc3HKjAgzhByE6/hxMZkPRzeG4xU9n3ZsJM2ROvl6s3yijsy/XnVzFVpLCpIrUvj4XPFfEVJIt9Al74FzItA30cv0p6Gx/fKx/LYXzAt+WCczL7jsENMK7LDG7EcSODm3Bcz+BmHJfSW8FxCb15PPdqYTODi9uXjQwunntgPYOL25u1DC5ub5bSG25vhtIbbm+G0htub4bSG25vhtIbbm+G0Rue27Ng1Ibn9iwYrRGZPozSDGFsDCxsa5TGYEujxgrbGbWwsJVRuwC2MWrLwhZGGZiFDYzyBxY2MMp9WdjAKG9rYQOjDgcLGxh1llncwiiVwSZGRQoWtjEqsLGwkVFxmIWtjAobHWxlTJTrHWxlTFDuHWxlzB3CO9jKmCuPd7CVeUplgUtVThBoZFOVPZCq7F1ir/nDl3PvMn3NjxUk8EljEc4PgxF6LPGeIGJ7VXi+xk3DuIbqPVObOJPtcklsRueOUc6+kfhXx+gnycYOlbcyz2S2XB7L0DWIk2Qz1wefJkmrreNnTcIxujhFk3AMgreltzhxZYLRJByjg7eTJBzXB+80Obvo4L0m2xgFD5MkBNdXJk6Sil3HT5qEXXRx8iTZxvXBl0mypav4DGfhBQ5cnGgmyQmuD95qEprRwbtJEo7rg/eahGN08GGSnOD64KMmoRkdPGOwrJ+PeZJs5vrKNBmsfI4w5IKGjZ1Tk8HKrj4xBsueUwkMfsto7JtaYl/Z3xJ5LgvW3bbkuSxkb5uSItcdHXqeIk2/PnQi7GXPidxNketeHXpLnstCduREnsuCPYQIBrAFe0ZkP0UqfX1ZgqIKAB16nCJNvz70pMilR4ee+RIAFLpMkKZfXZTSTZCmX0c3fLY7uCwETRW7D4uboLigviYNBiq7rdLSbUdGJ4j42EUniJRY6AzFP3E0/CkNZijeZkPXYIZJRsfNkAytQoebYWahnaLgBMX2E1SF1Nc7TFGJU4ePfLUMui5JUc+CYucp6lnqq1KmqDmpwptuirqQOrxRlLSAC2+sotIHxXaKohAU209Rz1Jf8jBFzUkdPioqfdCVSYqCExQ7T1EUUl+WMkUpThWeoNRhX22DNYqCExTbTlErU18Wpyg4QYfup6iVqQ89KApO0KHHKWpl6kNPWPfr0YyAYDUFFOgClClqP6oL0EvfOWYcbBdP+4fHen5JfJcKMkyL+rTa3h/JSU+IN79/XG6eVkeKx+X9hyP84+r+7UdHstLfXiSffwS16mtrvBhPNIcHjDeN/35zokDcvIx/d7yXpy7kbF3qfDIleOdD6pw57vVP4z++Hf/x8vjjw42nc8WacPjX8XtNtK7zMaealgxbRROgKpqA50O9pddUTKCXATU6wuCqIxze/70cqPGimuNX6r+PRn+NaoZRA50NlCsTj2TRTwGKfgKe9nQu+slAllYgsqB8x+AWuugHwiUyot4S9jBcQxf9YLiWLvrBcB1d9IPherroB8MNdNEPhhvpoh8MN9FFPxhupot+MNxCF/1AuEQrWMPoLRi66AfDtXTRD4br6KIfDNezRT8YbGCLfjDYyBb9YLCJLfrBYDNZ9IOhFrLoB0KNHVn0g6EasugHQ7Vk0Q+G6tiiHwzWs0U/GGxgi34w2MgW/WCwiS36wWAzW/SDwRa26AeCTR1b9IPBGrboB4O1bNEPBuvYoh8M1rNFPxhsYIt+MNjIFv1gsIkt+sFgM1v0g8EW9qZfufDmjr06266CZNhyF2uBcpfQSwwSCnTOz7IFey7JQKeWc3t022kaSYReelBVxrm3k1ZGAGTERhlAO1nnGmUkQEbXKENuHXJps6CVUQAZvk1GL4+oLsM0yjBAt6TcKAPpyBQaZQB2bhrtvAB23mjmBTDzRisviJU3ipCNvNHEi2zirXOQDbxNEbGTzbs0SpCNu9EmItBtrdG0I9BsrdFDxU627EZHGzvZshvPi9jJlt147EWg71fj6R2Bxl+NQUjsZNtujKWiob7S2u5n+Ep7+K3d4mG3or7VBid9mDWv31/t8T0i2hRDCF08tpJwzva+wKo+tEYj+7jG+D4a2cf5Rh9nZB/nG30czrD0ep2sXAKjob/E2tqQIvmlOABfiqNp6gdxPnJf6DJvl7uqnKzponlRo8XbaD5ulif442jOjR/DYOfMVzO+W95uVmLDzNXmsJS7h+1x5Ovd3fN634f/Y3jaRTXtpJj2AWu1WRwmv19J075d7g84fw//Gjrhoe6gL39x+P3V9tOx6/HzFlkk21SnFeE92NSQ7tw8GZBjVUq3/38p3akWySgWqXdYn4flutq4WsrXzh3EgU3SUgfuEi4natbZhdnXOanGFWcfV0u9q/O4Xlqq0Z2B5dSbBo6tsy1zr3O92eCo/rvZx2WnYFgC9OKmIEMC5HiV/t3s66xqq2797ONqIqmyuF4maXMKyFEF3ibPvs6qyNikucfV1rMRD0bbejfiwahXBaPGzr7OqvjPzB7/NTHsGTz+82ECNhNAjCr8mz3686rob/bgz+cJGEMApZQJKDJkMUEV+s0eYbU0w8Tj3qDxe7N7veDa2RGAuWtivtkjvqCJ+GaPQ1o4DnE3HDT+bvY7WAtFInHUBU2oZ2aP9GM3Qb2+PPsWqkUinowaf2dmP+ijJsyzs59BTa1N8ctXC9kjcZeMmiDPzh5Kxyn6ugGz19xw7eyxZNR4PTv7/balRyvxvNXCV0m8biaN13Ozh3lJ4/Xc7BFYC4Mm8bSdGrwe8WUjabyemz2gbGk6S3w/Shqv52YPKft5+COME69V3dZVkmc+7VarLUJ1kIs/ZtQMjqWF/5P43Js1XzK8V33tfdgiSsgN3zCI7+lZ4+V8mHPidNpOJdkm82k7voJ08VKHtV99ud2st58WX5Z3n4/fyt1oVk14XaG79SkFbXn/dbm9W933Psyf85oOCr1/PhjR14P0XnpTbVAEE+llOA6itIi9igKwPuV75DCMTJAFX1KHXIUcJvZKBlDVxIpqPm7+Pv7t7uH2Yb/4uDuCqpVDcJb2MoXqsyR4hC/zA3XdqyRAl9D9iCUkGPwvA0LnTDAQX/JV6vqJ32fSfHzebZd3q9EMk3Cd2FhZoIp/K4wDsPIciM44vmPXuzALdAkgWxYodQSZv0vcjBJBh9rLeKmtfuqVFSAL5KdZIIJC/JJNVJ8DYbGXGaDrTVisMyw4Zb8X+LbVJ+zXdfLqZ2YOl2eAtjkwHa+KOAfTKdq3oUo2RtEXDQan7PcC37T6BG9qL+umvvqemoOdZg5B0TNtZA5E6xxrWSUnRZcxGJyyX1OmWf2iaFBVX33bKZqBjcAZakniJEtiNW2vUCVbp2hLBYNT9mvcNMsVFB2TRlROncSmm2YOmpZYI3PIij5MsJIL3+IIxe7lGQOLP02Q7igbnybudZbvtVRXt3N8+6MRNM+39YH1GyjjmmatI9/rB56PohnPyMozB/BEi1Po1jbo2viObm1TXxpv6JYtI2BMqDyNwXtH94WB15k5dKdxmUSDZ/YE8JHuxDKi6ES3GBkBo6xzmriA6OdMn+OBOWsnitWIFs908Bks33ukrm2in7ORT+jA2OhE14gQ+J4m8FozQfJEN0Wiz7OVz9qAh8j0RToUvk0Fih0Zq53ohSQavndFfeUjc/pO9E4VHd98AtYIHi9bOfqORJ8Q9v2R6Ops5aeWXmIeoMdpXnsjcwZP9EoecWt2ciBL9HemPyIkIkiWo2SimTP9LSU5Ro/ThOCJOYMn+gBItIN2cjibiL6VbNxNdH92cqyc8NOV/ZKbEvMld5ov3Skzp66fJlbOuDWPZR8M81q9pVp9OPzw/gz1cb172kusVac0qsXtYQn+vHlJvDsM74Xxpjv+55fH5W65P4q5+c+bS2bekUXrLHW72v/1sPvzhTWrMn3c/Xg5nCd6VY+lr/yyi4nHKF6+zWTmFc9Pc5vJkU3K8xWgRCflxQpSZodUAyr0kIZ5pxPCXxvOYUXWsJolhL/2kjenlAHw1142qlIGxVOtlEHxVCtlUDzVShkUT7VSBsVTrZRB8VQrZVA81SoZuaN4qpUyKJ5qpQyKp1opg+KpVspgeKqVIhieaqUIhqdaKYLgqVZKIHiqlRIInmqdBEPwVCslMDzVShEMT7VSBMNTrRTB8FQrRTA81UoRDE+1UgTDU60UwfBUK0UwPNU6EVY27saQMFuGoVkpgmFoVopgGJqVIuhSr1wBoku9XFdBiteFT3efT1zm1fKnNz26Dno+y3YSruZXafW6vmzbuJpfBUCFfWNss1c0zJc9O1AFd/mDP4Yn1MbC/PNNyE3CmCzvhF6C3Vg178K/Apphw2ji1Dy/kALDbeMUZvTc91IS8/Jhcnerwzy3nzBu5Kzj7PT2592vYQpSZWADxClIlQE5beTFP89Gy03k0D/PPMoUpM2y3pvIQZ3B5bSRI/80etGRj9ry083DYefgMUIbOQebuEVtxrdPmIJbGpATm7ilGfWuD2fU+z4HNRqIrGMXtV6z7YYaMHj24LTDHUf6nxj74JVZ5ymYqwGtlymYq2U5OvpSk1VavOIXCcP6G262May60349DvnPq18d1lwwTVzYzExHXN/QlAdJGUb7h2we/lrcr7ZPx0/Dh/v0893+ebeSPWywU9BuA5vKTUG7DcjxTfTWfAh/9SFfOv3ef72XlPr6HiLu49DENf6P2MdxCvpwYH8lLCIpowFJCwHsAr8uqQhgF6pbxvPmYAXSbhi9wQ42RSI6G+XYtXCb/5qWH80ExOnyRop2AuJ0QIxrIU7/5farb2BK/+UmG9rJ54ENFNtp3gEpqYHmnbp8XVIOx58G97vl9unxYbdf3K42yMNgrypg7BiLo6dYLO0U7vJqp66Bvv7nWO0WUl4iNlGR8mrefF6ZSaH2h6cL2afVcrf46/PhGid7iuQmoIcHFsu3kOP/PKsVWujnZ3sJSnEC8n1AiamF5b75vYnW4dAx+nikYQR8SJ6AOR9Y0TIBc74sJnctzPm/lOIy9i3X+tGztoVamHhZVlEL2zi3O8l+AvJ8YPahpXVA+5ngiPfPSlA+2IS7vjfjBN0CgHVNLd0CfsV1zRMQ/gPrWlraHfyC61q6CTocyOtaTEuHg19xXe0EvROAdXUtvRN+xXX1TFeGw9nPdGWIqdRaMOQSWnoj/IorHSfoOQHs4DRBhwdATG7p8PArqq+QWcWVXOByxR+OZRXbCpJR9Go4BkVASnHpVXGx3Smcu+bvf5eAU83n9pVpOnUzhqlH4hVdJk4LPgwXFO0cRuCiop0DvB2Sup3DeyUMf2uidZEVjRzg2RZ6tl1ltruHuz9X+8UrxcDbtwhd94rCMJlfkn6rO4bhLr/kQtfhrKLXA6oShpXcJRbcs/q+iJhV34Eel/8h44qKFg8jGycpul6MwGVFxwh4qxRFxwgU3NJ9hy4i5tR3r/YMHNflTWvWcVlFo4j6xmF41F0nw3lF3wl4q9Cu4fLI+k4l3yWLDAuMikYX8Gzo8OLylP9uNlf5ldp9lRXtI0Y2QlF01KjDuU7RjQLVhKNN3dTi/tOtZliIVbS8gGdA3xdM7b7wvF9vTml+d+vV9u5wdV627CqGhN3I1wcXFF02RuCiokPFgE4mp9MaVMJ8vFrF0b7IuB+zf7Kizcc/UkNF0VmjvvM9HXWZTrjbHo+gSXROcOT30qXrU7WKJiI/YgvVFm7GXeTpcyL9MK17vh3LP1VLge+qMrL/+Z67FZ3ffV59Wd8tN1NpPPHtXkammfl2Lz9i/wwv2py7p/B9Yv6RCxH4M+7HbPzA3jd+1Lgs3wWobpBE5wn5EA+e7u/zz9zTge4fNLKo7MlQOxjOn0Mn2oeJbjL0I5Q9PMs5lZ1J/aQfpJ9C9zaqb8LY0T2Y/pHKjvShULuQLZ/3D1+WE4bm0fLdm36EjmoTnVNLju7ENbL12U9w1UeX6VUe+CZUIxONfLusf+oGYl/aqg+1p0z3YRmZ75iFvjQTXWSMfDdNbIhefXi/rntU7nqi8YyVA2Ci8Qz94J8c35oLxmbdUvW71DRKCXzXrhGlsDFv9RPi94Up2gkmvqkXrMvMN/UaWbzCN/VCR5o7vqlXfaSZjaaqH+9r1BdKZWc2x7Ca7TD1wBzfHmxk/T3fHgzeKYFv6AVjR7712MgqsIe98z9I2ezN0qUfNLDCtwZDdVs6volZXbfF8I3GRtAs32gMnjf70aea2DmxsgsbaFTza6ceWOBblsHaiHw/sJF9k/iGWCNome8uBs+bzS+uZrRPqmzb4cUJb1UOtgJk6CqH2pAsO6QakKOHFCtInujIdXTNNIv9QUYgOnJpZUSiI5dWRiI6cmllZKIjl1ZGITpyKWUALWIuHbm0MgzRkUsrwxIdubQyHNGRSyvDEx25tDIC0ZFLKyMSHbm0MhLRkUsrI+MdubQiCt6RSynCdnhHLq0IA3fk0kqwcEcurQQHd+TSSvBwRy6thIB35NKKiHhHLq2IhHfk0orIeEcurYiCd+RSinAd3pFLK8LgHbm0IizekUsrwuEdubQiPN6RSysi4B25tCIi3pFLKyLhHbm0ItimyrWLl6ObKrs8jOTpi+4B6I+XqR9XavO8etytt8dPOZvl7WpzvMlvLqlPpuv+x/Hb6tfV7ukElVx3pGa2uTPfvv0/wwlFNQ==';
    loadBlueprintString(SAMPLE);
});
