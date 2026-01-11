"use client"

import React from "react"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption,
  Button, 
  Card, 
  CardContent, 
  Badge 
} from '@hua-labs/hua-ux'
import { ComponentLayout } from '@hua-labs/hua-ux'

// API 문서용 타입 정의
const TABLE_TYPES = {
  variant: "'default' | 'bordered' | 'striped'",
  variantDefault: "'default'",
  size: "'sm' | 'md' | 'lg'",
  sizeDefault: "'md'",
}

export default function TablePage() {
  const sampleData = [
    { id: 1, name: "김철수", email: "kim@example.com", role: "관리자", status: "활성" },
    { id: 2, name: "이영희", email: "lee@example.com", role: "사용자", status: "활성" },
    { id: 3, name: "박민수", email: "park@example.com", role: "사용자", status: "비활성" },
    { id: 4, name: "정수진", email: "jung@example.com", role: "관리자", status: "활성" },
    { id: 5, name: "최동현", email: "choi@example.com", role: "사용자", status: "활성" },
  ]

  return (
    <ComponentLayout
      title="Table"
      description="테이블 컴포넌트입니다. 데이터를 행과 열로 표시합니다."
      prevPage={{ title: "Card", href: "/components/card" }}
      nextPage={{ title: "Tabs", href: "/components/tabs" }}
      breadcrumbItems={[
        { label: "Components", href: "/components" },
        { label: "Table" }
      ]}
    >
      {/* 기본 Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          기본 Table
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Table>
            <TableCaption>사용자 목록</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "활성" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 스타일별 Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          스타일별 Table
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              테두리 있는 테이블
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Table variant="bordered">
                <TableHeader>
                  <TableRow>
                    <TableHead>제품명</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>재고</TableHead>
                    <TableHead>카테고리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>노트북</TableCell>
                    <TableCell>1,200,000원</TableCell>
                    <TableCell>15개</TableCell>
                    <TableCell>전자제품</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>마우스</TableCell>
                    <TableCell>50,000원</TableCell>
                    <TableCell>100개</TableCell>
                    <TableCell>액세서리</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>키보드</TableCell>
                    <TableCell>150,000원</TableCell>
                    <TableCell>30개</TableCell>
                    <TableCell>액세서리</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              줄무늬 테이블
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Table variant="striped">
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>매출</TableHead>
                    <TableHead>주문 수</TableHead>
                    <TableHead>평균 주문액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-01-01</TableCell>
                    <TableCell>2,500,000원</TableCell>
                    <TableCell>45건</TableCell>
                    <TableCell>55,556원</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-01-02</TableCell>
                    <TableCell>3,200,000원</TableCell>
                    <TableCell>52건</TableCell>
                    <TableCell>61,538원</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-01-03</TableCell>
                    <TableCell>1,800,000원</TableCell>
                    <TableCell>38건</TableCell>
                    <TableCell>47,368원</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* 크기별 Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          크기별 Table
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              작은 크기
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Table size="sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>등급</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>김철수</TableCell>
                    <TableCell>95</TableCell>
                    <TableCell>A+</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>이영희</TableCell>
                    <TableCell>88</TableCell>
                    <TableCell>A</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              큰 크기
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Table size="lg">
                <TableHeader>
                  <TableRow>
                    <TableHead>프로젝트명</TableHead>
                    <TableHead>담당자</TableHead>
                    <TableHead>진행률</TableHead>
                    <TableHead>마감일</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>웹사이트 리뉴얼</TableCell>
                    <TableCell>김개발</TableCell>
                    <TableCell>75%</TableCell>
                    <TableCell>2024-02-15</TableCell>
                    <TableCell>
                      <Badge variant="default">진행중</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>모바일 앱 개발</TableCell>
                    <TableCell>이디자인</TableCell>
                    <TableCell>90%</TableCell>
                    <TableCell>2024-01-30</TableCell>
                    <TableCell>
                      <Badge variant="default">진행중</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터가 있는 Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          푸터가 있는 Table
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>부서</TableHead>
                <TableHead>1월</TableHead>
                <TableHead>2월</TableHead>
                <TableHead>3월</TableHead>
                <TableHead>총계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>영업팀</TableCell>
                <TableCell>1,200만원</TableCell>
                <TableCell>1,500만원</TableCell>
                <TableCell>1,800만원</TableCell>
                <TableCell>4,500만원</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>마케팅팀</TableCell>
                <TableCell>800만원</TableCell>
                <TableCell>1,000만원</TableCell>
                <TableCell>1,200만원</TableCell>
                <TableCell>3,000만원</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>개발팀</TableCell>
                <TableCell>500만원</TableCell>
                <TableCell>600만원</TableCell>
                <TableCell>700만원</TableCell>
                <TableCell>1,800만원</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableHead>총계</TableHead>
                <TableHead>2,500만원</TableHead>
                <TableHead>3,100만원</TableHead>
                <TableHead>3,700만원</TableHead>
                <TableHead>9,300만원</TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          실제 사용 예시
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                사용자 관리
              </h3>
              <div className="space-y-4">
                <Table size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>김철수</TableCell>
                      <TableCell>
                        <Badge variant="default">활성</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">편집</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  사용자 목록을 관리할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                주문 내역
              </h3>
              <div className="space-y-4">
                <Table size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문번호</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>#12345</TableCell>
                      <TableCell>
                        <Badge variant="default">완료</Badge>
                      </TableCell>
                      <TableCell>150,000원</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  주문 내역을 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                재고 관리
              </h3>
              <div className="space-y-4">
                <Table size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>제품</TableHead>
                      <TableHead>재고</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>노트북</TableCell>
                      <TableCell>15개</TableCell>
                      <TableCell>
                        <Badge variant="default">충분</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  재고 현황을 관리할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                통계 데이터
              </h3>
              <div className="space-y-4">
                <Table size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>지역</TableHead>
                      <TableHead>매출</TableHead>
                      <TableHead>비율</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>서울</TableCell>
                      <TableCell>5,000만원</TableCell>
                      <TableCell>50%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  통계 데이터를 표시할 때 사용합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 사용법 가이드 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          사용법 가이드
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                기본 사용법
              </h3>
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@hua-labs/hua-ux'

function MyComponent() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>역할</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>김철수</TableCell>
          <TableCell>kim@example.com</TableCell>
          <TableCell>관리자</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>이영희</TableCell>
          <TableCell>lee@example.com</TableCell>
          <TableCell>사용자</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

// 스타일 지정
<Table variant="bordered" size="lg">
  내용
</Table>

// 푸터 추가
<Table>
  <TableHeader>
    헤더
  </TableHeader>
  <TableBody>
    본문
  </TableBody>
  <TableFooter>
    푸터
  </TableFooter>
</Table>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Props
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-200 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <th className="px-4 py-2 text-left">Prop</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Default</th>
                      <th className="px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 font-mono">variant</td>
                      <td className="px-4 py-2 font-mono">{TABLE_TYPES.variant}</td>
                      <td className="px-4 py-2 font-mono">{TABLE_TYPES.variantDefault}</td>
                      <td className="px-4 py-2">테이블 스타일</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono">size</td>
                      <td className="px-4 py-2 font-mono">{TABLE_TYPES.size}</td>
                      <td className="px-4 py-2 font-mono">{TABLE_TYPES.sizeDefault}</td>
                      <td className="px-4 py-2">테이블 크기</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentLayout>
  )
} 