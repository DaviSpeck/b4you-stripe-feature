module.exports = {
  up: async (queryInterface, Sequelize) => {
    let total = 100;
    let offset = 0;
    while (total !== 0) { 
      const [sales] = await queryInterface.sequelize.query(`select
        st.full_name,
        st.whatsapp,
        st.document_number,
        st.email,
        s.id
      from
        sales s 
        join students st 
        on s.id_student = st.id
      where s.full_name is NULL
      LIMIT 100 OFFSET ${offset}`);

      total = sales.length;
      offset += 100;

      // eslint-disable-next-line no-await-in-loop
      for await (const { full_name, whatsapp = null, document_number = null, email = null, id} of sales) {
        console.log(id)
        await queryInterface.sequelize.query(
          `UPDATE sales set full_name="${full_name}", whatsapp="${whatsapp}", document_number="${document_number}", email="${email}" where id=${id}`,
        );
      }
  }
  },
  down: async (queryInterface) => {
     
  },
};
