import sys
import os

trlc = 'abcçdefgğhıijklmnoöprsştuüvyz'
truc = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'
trutf8 = 'çğıöşüÇĞİÖŞÜ'
trascii = 'cgiosuCGIOSU'

l2u = {ord(trlc[i]):ord(truc[i]) for i in range(29)}
u2l = {ord(truc[i]):ord(trlc[i]) for i in range(29)}
u2a = {ord(trutf8[i]):ord(trascii[i]) for i in range(12)}

def trcap(answer):
    answer = answer.strip()
    for i in range(len(answer)):
        if answer[i].isspace():
            answer = answer[:i+1] + answer[i+1].translate(l2u) + answer[i+2:]
    return answer


if len(sys.argv) != 3:
    print("usage: python multians.py <file> <language tr | en>")
    quit()

file = sys.argv[1]
lang = sys.argv[2]

if not os.path.exists(file):
    print(f"'{file}' does not exist")

if lang != "tr" and lang != "en":
    print(f"language attribute must be either 'tr' or 'en'")

with open(file) as f:
    questions = f.readlines()

for q in questions:
    q = q.strip()
    if not q: continue
    try:
        oldanswers = q.split("|")[1:]
    except TypeError:
        print(f"'{file} is not in the appropriate format")
        quit()
    answers = []
    if lang == "tr":
        for ans in oldanswers:
            ans = ans.strip()
            if len(ans.split(" ")) > 1: answers.append(trcap(ans))
            answers.append(ans[0].translate(l2u) + ans[1:].translate(u2l))
            answers.append(ans.translate(u2l))
            answers.append(ans.translate(u2l).translate(u2a))
    else:
        for ans in oldanswers:
            answers.append(ans.capitalize())
            answers.append(ans.lower())
            answers.append(ans)
    print(q.split("|")[0].strip(),*answers,sep=" | ")
