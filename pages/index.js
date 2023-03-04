import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import DataTable from 'react-data-table-component';
import Multiselect from 'multiselect-react-dropdown';
import fetchData from './api/csvFetch'

export default function Home() {

  const [csvType,setCsvType] = useState('small')
  const [data,setData] = useState([]);
  const [columns,setColumns] = useState([]);
  const [columnsFormatted,setColumnsFormatted] = useState({});
  const [selectedFilters,setFilters] = useState({});
  const [defaultData,setDefault]= useState([]);
  const [currentFilter,setCurrentF] = useState('');
  const [loader,setLoader] = useState(true)
  const itemsRef = useRef([]);

  useEffect(()=>{
    fetchData(csvType).then(res=>{
      parseCSV(res);
      itemsRef.current.forEach(item=>item?.resetSelectedValues())
    })
  },[csvType]);

  const updateData=(selectedFilters,type='add')=>{
    let currentD = type=='add'?data:defaultData // use previous data is any sub filter applied, otherwise use default data
    setLoader(true)
    if(Object.keys(selectedFilters).length==0){ // need entire csv data in table if no filter
      setData(defaultData);
      let columnsFormat ={}
      columns.map((col,index)=>{
        columnsFormat[col.name] = col.filters
      })
      setColumnsFormatted(columnsFormat)
      // setLoader(false)
    }
    
    else{
      let columnsFormat = columnsFormatted
      let res = []
      columns.map((col,index)=>{ // re-calculating filter counts
        if(!selectedFilters[col.name])
          columnsFormat[col.name]={}
      })

      currentD.map(d=>{
        let isValid = true
        Object.keys(selectedFilters).map(filter=>{
          if(!selectedFilters[filter].includes(d[filter]))isValid = false
        })
        if(isValid){
          res.push(d);
          Object.keys(d).map((k,i)=>{
            if(!selectedFilters[k]){
              if(!columnsFormat[k][d[k]]) columnsFormat[k][d[k]]=0
              columnsFormat[k][d[k]]++
            }
            if(i==Object.keys(d).length-1)
            setLoader(false)
          })
        }
      })
      setData(res)
      setColumnsFormatted(columnsFormat)
      // setLoader(false)
    }
  }


  const parseCSV = (data) => { //convert csv data to formatted json for table and filters
    // setLoader(true)
    let cols = {}
    // create empty array
    const csvData = [];
    
    // this will return each line as an individual String
    const lines = data.split("\n");
    
    // loop through the lines and return an array of individual   
    // Strings within the line that are separated by a comma
    // for(let i=0;i<lines[0].length;i++){

    // }
    
    for (let i = 0; i < lines.length; i++) {
      let row  = lines[i].split(",");
      let col = lines[0].split(",")
        if(i==0){
          col.forEach(element => {
            cols[element] = {}
          });
        }else{
          let obj = {};
          row.forEach((element,index)=>{
            obj[col[index]]=element;
            if(!cols[col[index]][element])cols[col[index]][element]=0;
            cols[col[index]][element]++
          })
          csvData[i]=obj
        }
    }

    let columnsFormat = {}
    let columns = lines[0].split(",").map(element=>{
      columnsFormat = {...columnsFormat,[element]:cols[element]}
      return {name:element,selector: row => row[element],filters:cols[element]}
    })
    setColumnsFormatted(columnsFormat)
    setDefault(csvData);
    setData(csvData);
    setColumns(columns)
    setLoader(false)
    return [columns,csvData];
  };

  const filters = () => { // for rendering filters
    return columns.map((col,i)=>{
    return <div 
    key={`filter-${col.name}`}
    className='margin-1rem'
    >
      <Multiselect
      ref={el => itemsRef.current[i] = el} 
      displayValue="key"
      placeholder={col.name}
      onRemove={function noRefCheck(selected){
        let appliedD = {...selectedFilters,[col.name]:selected.map(ele=>ele.cat)};
        if(selected.length==0)
        delete appliedD[col.name]
        
        setFilters(appliedD)
        updateData(appliedD,'remove')
      }}
      onSelect={function noRefCheck(selected){
        setLoader(true)
        setCurrentF(col.name)
        setFilters({...selectedFilters,[col.name]:selected.map(ele=>ele.cat)});
        if(currentFilter==col.name)
        updateData({...selectedFilters,[col.name]:selected.map(ele=>ele.cat)},'update')
        else updateData({...selectedFilters,[col.name]:selected.map(ele=>ele.cat)},'add')
      }}
      options={Object.keys(columnsFormatted[col.name]).map(option=>{
        return {
          cat: option,
          key: `${option} (${columnsFormatted[col.name][option]})`,
        }
      })}
      showCheckbox
  /></div>})
  }

  return (
    <>
      <Head>
        <title>Loop Kitchen Assignment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div style={{color:'white'}}>
          <span>Switch Data Set Type </span>
          <input type='radio' id="small" checked={csvType=='small'?true:false} onChange={()=>{setCsvType('small');setLoader(true)}} value="small"/>
          <label className='margin-1rem' for="small">Small</label>
          <input type='radio' id="large" checked={csvType=='large'?true:false} onChange={()=>{setCsvType('large');setLoader(true)}} value="large"/>
          <label className='margin-1rem' for="large">Large</label>
        </div>
        <div style={{display:'flex',flexWrap:'wrap'}}>
          {data.length?filters():null}
          <button className='margin-1rem btn-custom' onClick={()=>{
            setLoader(true)
            updateData({});setFilters({});
            itemsRef.current.forEach(item=>item.resetSelectedValues())
            }}>Reset Filter</button>
        </div>
        <div className='data-table-parent'>
          {data.length>0 && loader==false?<DataTable
            columns={columns}
            data={data}
            pagination
          />:<div className='placeholder-item'><div class="container">
          <div class="Loading"></div>
        </div></div>}
        </div>
      </main>
    </>
  )
}
